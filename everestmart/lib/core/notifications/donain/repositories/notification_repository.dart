abstract class NotificationRepository {
  /// Register device token with backend
  Future<void> registerDevice();

  /// Remove device token from backend (logout)
  Future<void> unregisterDevice();
}
