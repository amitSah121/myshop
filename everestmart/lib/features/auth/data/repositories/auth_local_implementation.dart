import 'package:everestmart/features/auth/data/datasources/auth_local_datasource.dart';

import '../../../../core/storage/hive_boxes.dart';

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  @override
  Future<void> saveToken(String token) async {
    await HiveBoxes.authBox.put('token', token);
  }

  @override
  Future<void> clearToken() async {
    await HiveBoxes.authBox.delete('token');
  }

  @override
  Future<String?> getToken() async {
    return HiveBoxes.authBox.get("token");
  }
}
