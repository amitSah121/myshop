abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login(String email, String password);
  Future<Map<String, dynamic>> register(Map<String, dynamic> payload);
  Future<Map<String, dynamic>> loginWithGoogle(String idToken);
}
