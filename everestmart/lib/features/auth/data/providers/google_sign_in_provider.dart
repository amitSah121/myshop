import 'package:everestmart/core/error/failures.dart';
import 'package:google_sign_in/google_sign_in.dart';

class GoogleSignInProvider {
  Future<String> getIdToken() async {
    final googleSignIn = GoogleSignIn.instance;

    // if (!googleSignIn.) {
    await googleSignIn.initialize();
    // }

    final account = await googleSignIn.authenticate();
    final auth = await account.authentication;

    final idToken = auth.idToken;
    if (idToken == null) {
      throw AuthFailure('Failed to get Google ID token');
    }

    return idToken;
  }
}
