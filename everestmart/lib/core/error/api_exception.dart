import 'package:dio/dio.dart';
import 'failures.dart';

class ApiException implements Exception {
  final Failure failure;

  ApiException(this.failure);

  static ApiException from(dynamic error) {
    // ================= DIO =================
    if (error is DioException) {
      final response = error.response;
      final status = response?.statusCode;

      // ⏱ TIMEOUTS
      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.receiveTimeout ||
          error.type == DioExceptionType.sendTimeout) {
        return ApiException(
          NetworkFailure('Connection timeout'),
        );
      }

      // ❌ CANCELLED
      if (error.type == DioExceptionType.cancel) {
        return ApiException(
          NetworkFailure('Request cancelled'),
        );
      }

      // 📡 NO RESPONSE (likely no internet)
      if (response == null) {
        return ApiException(
          NetworkFailure('No internet connection'),
        );
      }

      // 📦 BACKEND MESSAGE EXTRACTION
      String message = 'Request failed';
      final data = response.data;

      if (data is Map<String, dynamic>) {
        message = data['message'] ??
            data['error'] ??
            message;
      }

      // 🔐 AUTH
      if (status == 401 || status == 403) {
        return ApiException(
          AuthFailure(message),
        );
      }

      // 🧾 VALIDATION
      if (status == 422) {
        return ApiException(
          ValidationFailure(message),
        );
      }

      // 💥 SERVER
      if (status != null && status >= 500) {
        return ApiException(
          ServerFailure(
            message,
            statusCode: status,
          ),
        );
      }

      // ❓ OTHER HTTP ERRORS
      return ApiException(
        ServerFailure(
          message,
          statusCode: status,
        ),
      );
    }

    // ================= UNKNOWN =================
    return ApiException(
      UnknownFailure('Unexpected error occurred'),
    );
  }
}
