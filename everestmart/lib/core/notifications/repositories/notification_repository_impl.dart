import 'package:everestmart/core/error/api_exception.dart';
import 'package:everestmart/core/notifications/donain/repositories/notification_repository.dart';

import '../../network/api_client.dart';
import '../datasources/notification_remote_datasource.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource remote;
  final ApiClient api;

  NotificationRepositoryImpl({
    required this.remote,
    required this.api,
  });

  @override
  Future<void> registerDevice() async {
    final token = await remote.getDeviceToken();
    if (token == null) return;

    try {
      await api.post('/users/device-token', {
        'token': token,
      });
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  @override
  Future<void> unregisterDevice() async {
    try {
      await api.post('/users/device-token/remove', {});
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
