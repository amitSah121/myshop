import 'package:everestmart/features/auth/data/models/auth_token_model.dart';

import '../entities/auth_user.dart';

abstract class AuthRepository {
  Future<AuthTokenModel> login(String email, String password);

  Future<AuthUser> getMe();

  Future<void> logout();

  Future<bool> isLoggedIn();


  Future<AuthTokenModel> loginWithGoogle(String idToken);

  Future<void> register({
    required String name,
    required String email,
    required String password,
  });

}
