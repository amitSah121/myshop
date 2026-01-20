import 'package:dio/dio.dart';
import 'package:flutter/widgets.dart';
import '../error/api_exception.dart';
import '../error/network_exception.dart';
import 'api_client.dart';
// import 'token_provider.dart';

class DioClient implements ApiClient {
  final Dio _dio;
  // final TokenProvider? tokenProvider;

  DioClient({
    required String baseUrl,
    // this.tokenProvider,
  }) : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
          ),
        ) {
    // _dio.interceptors.add(
    //   InterceptorsWrapper(
    //     onRequest: (options, handler) {
    //       final token = tokenProvider?.token;
    //       // print(token);
    //       if (token != null && token.isNotEmpty) {
    //         options.headers['Authorization'] = 'Bearer $token';
    //       }
    //       handler.next(options);
    //     },
    //   ),
    // );
  }

  @override
  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    try {
      final response = await _dio.get(path, queryParameters: query);
      return response.data;
    } on DioException catch (e) {
      throw ApiException.from(e);
    } catch (_) {
      throw NetworkException.noInternet();
    }
  }

  @override
  Future<dynamic> post(String path, dynamic data) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } 
    // on DioException catch (e) {
    //   throw ApiException.from(e);
    // } 
    catch (e) {
      // throw NetworkException.noInternet();
      debugPrint(e.toString());
      // debugPrintStack(e.);
    }
  }

  @override
  Future<dynamic> put(String path, dynamic data) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } on DioException catch (e) {
      throw ApiException.from(e);
    } catch (_) {
      throw NetworkException.noInternet();
    }
  }

  @override
  Future<dynamic> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } on DioException catch (e) {
      throw ApiException.from(e);
    } catch (_) {
      throw NetworkException.noInternet();
    }
  }
}
