abstract class UserLocalDataSource {
  Future<void> cacheUser(Map<String, dynamic> userJson);
  Future<Map<String, dynamic>?> getCachedUser();
  Future<void> clear();
}
