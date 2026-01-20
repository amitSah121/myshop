import 'package:firebase_messaging/firebase_messaging.dart';
import 'notification_remote_datasource.dart';

class FcmDataSource implements NotificationRemoteDataSource {
  final FirebaseMessaging _messaging;

  FcmDataSource(this._messaging);

  @override
  Future<String?> getDeviceToken() async {
    return await _messaging.getToken();
  }
}
