import 'failures.dart';

class NetworkException implements Exception {
  final Failure failure;

  NetworkException(this.failure);

  static NetworkException noInternet() {
    return NetworkException(
      NetworkFailure('No internet connection'),
    );
  }

  static NetworkException timeout() {
    return NetworkException(
      NetworkFailure('Request timed out'),
    );
  }
}
