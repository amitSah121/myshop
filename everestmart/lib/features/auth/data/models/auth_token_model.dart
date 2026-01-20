import '../../domain/entities/auth_token.dart';

class AuthTokenModel extends AuthToken {
  const AuthTokenModel(super.token);

  factory AuthTokenModel.fromJson(Map<String, dynamic> json) {
    return AuthTokenModel(json['token']);
  }
}
