import 'package:everestmart/features/auth/data/providers/google_sign_in_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import 'auth_form_field.dart';
import 'auth_primary_button.dart';
import 'auth_loading_overlay.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final emailCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          Navigator.pushReplacementNamed(context, '/profile');
        } else if (state is AuthFailureState) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        return AuthLoadingOverlay(
          isLoading: state is AuthLoading,
          child: Scaffold(
            appBar: AppBar(title: const Text('Login')),
            body: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    AuthFormField(
                      controller: emailCtrl,
                      label: 'Email / Phone',
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    AuthFormField(
                      controller: passwordCtrl,
                      label: 'Password',
                      obscure: true,
                      validator: (v) =>
                          v == null || v.length < 6 ? 'Invalid password' : null,
                    ),
                    const SizedBox(height: 20),
                    AuthPrimaryButton(
                      text: 'Login',
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          context.read<AuthBloc>().add(
                                AuthLoginRequested(emailCtrl.text.trim(),passwordCtrl.text.trim(),
                                ),
                              );
                        }
                      },
                    ),
                    const SizedBox(height: 12),

                    OutlinedButton.icon(
                      icon: const Icon(Icons.icecream_outlined),
                      label: const Text('Continue with Google'),
                      onPressed: () async{
                        try {
                          final provider = GoogleSignInProvider();
                          final idtoken = await provider.getIdToken();

                          context
                              .read<AuthBloc>()
                              .add(AuthGoogleLoginRequested(idtoken));
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(e.toString())),
                          );
                        }
                      },
                    ),

                    const SizedBox(height: 12),

                    ElevatedButton.icon(
                      icon: const Icon(Icons.app_registration),
                      label: const Text('Register'),
                      onPressed: () async{
                        Navigator.of(context).pushNamed("/register");
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
