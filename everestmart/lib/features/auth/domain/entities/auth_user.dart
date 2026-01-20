class AuthUser {
  final String id;
  final String email;
  final String name;
  final bool isAdmin;
  final bool isRider;
  final String role; // admin | customer | rider

  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.isAdmin,
    required this.isRider,
    required this.role,
  });
}
