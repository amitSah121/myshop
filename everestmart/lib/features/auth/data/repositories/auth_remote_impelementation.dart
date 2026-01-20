import 'package:everestmart/features/auth/data/datasources/auth_remote_datasource.dart';

import '../../../../core/network/api_client.dart';

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient api;

  AuthRemoteDataSourceImpl(this.api);

  @override
  Future<Map<String, dynamic>> login(String email, String password) async {
    return await api.post('/auth/login', {
      'email': email,
      'password': password,
    });
  }

  @override
  Future<Map<String, dynamic>> register(Map<String, dynamic> payload) async {
    return await api.post('/auth/register', payload);
  }

  @override
  Future<Map<String, dynamic>> loginWithGoogle(String idToken) async {
    return await api.post('/auth/google', {
      'idToken': idToken,
    });
  }
}
