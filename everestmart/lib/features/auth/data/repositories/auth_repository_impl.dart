import 'package:everestmart/core/error/failures.dart';
import 'package:everestmart/core/network/api_client.dart';
import 'package:everestmart/core/network/api_endpoints.dart';
import 'package:everestmart/features/auth/domain/entities/auth_user.dart';

import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/auth_token_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remote;
  final AuthLocalDataSource local;
  final ApiClient api;

  AuthRepositoryImpl({
    required this.remote,
    required this.local,
    required this.api
  });
  
  @override
  Future<AuthTokenModel> login(String email,String password) async {
    final response = await remote.login(email, password);
    final token = AuthTokenModel.fromJson(response);
    await local.saveToken(token.token);
    return token;
  }

  @override
  Future<AuthTokenModel> loginWithGoogle(String idToken) async {
    try {
      final response = await remote.loginWithGoogle(idToken);
      final token = AuthTokenModel.fromJson(response);
      await local.saveToken(token.token);
      return token;
    } on Failure {
      rethrow;
    } catch (_) {
      throw AuthFailure('Google login failed');
    }
  }


  @override
  Future<void> logout() async {
    await local.clearToken();
  }

  @override
  Future<AuthUser> getMe() async {
    return await api.get(ApiEndpoints.me);
  }

  @override
  Future<bool> isLoggedIn() async{
    return (await local.getToken()) != null;
  }
  
  @override
  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      Map<String, dynamic> payload = {"name": name, "email": email, "password": password};
      final response = await remote.register(payload);

      final token = AuthTokenModel.fromJson(response);
      await local.saveToken(token.token);
    } on Failure {
      rethrow;
    } catch (_) {
      throw AuthFailure('Registration failed');
    }
  }
}
