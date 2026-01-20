abstract class AuthLocalDataSource {
  Future<void> saveToken(String token);
  Future<void> clearToken();
  Future<String?> getToken();
}
