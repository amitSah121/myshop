import '../../domain/entities/auth_user.dart';

class AuthUserModel extends AuthUser {
  const AuthUserModel({
    required super.id,
    required super.email,
    required super.name,
    required super.isAdmin,
    required super.isRider,
    required super.role,
  });

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: json['_id'] ?? json['id'],
      email: json['email'],
      name: json['name'] ?? '',
      isAdmin: json['isAdmin'] == true,
      isRider: json['isRider'] == true,
      role: json['role'] ?? 'customer',
    );
  }
}
