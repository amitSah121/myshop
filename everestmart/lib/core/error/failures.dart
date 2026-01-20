/// Base failure class for the entire app
abstract class Failure {
  final String message;

  const Failure(this.message);

  @override
  String toString() => '$runtimeType(message: $message)';
}

/// Internet / connectivity issues
class NetworkFailure extends Failure {
  const NetworkFailure(String message) : super(message);
}

/// Backend / server-side failures
class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure(
    String message, {
    this.statusCode,
  }) : super(message);
}

/// Authentication / authorization failures
class AuthFailure extends Failure {
  const AuthFailure(String message) : super(message);
}

/// Input validation / form errors
class ValidationFailure extends Failure {
  const ValidationFailure(String message) : super(message);
}

/// Cache / local storage issues
class CacheFailure extends Failure {
  const CacheFailure(String message) : super(message);
}

/// Anything unexpected
class UnknownFailure extends Failure {
  const UnknownFailure(String message) : super(message);
}
