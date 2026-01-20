import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import 'auth_form_field.dart';
import 'auth_primary_button.dart';
import 'auth_loading_overlay.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
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
            appBar: AppBar(title: const Text('Register')),
            body: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    AuthFormField(
                      controller: nameCtrl,
                      label: 'Full Name',
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
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
                          v == null || v.length < 6 ? 'Min 6 chars' : null,
                    ),
                    const SizedBox(height: 20),
                    AuthPrimaryButton(
                      text: 'Register',
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          context.read<AuthBloc>().add(
                            AuthRegisterRequested(nameCtrl.text.trim(),emailCtrl.text.trim(),passwordCtrl.text.trim(),),
                          );
                        }
                      },
                    ),
                    const SizedBox(height: 12),

                    ElevatedButton.icon(
                      icon: const Icon(Icons.app_registration),
                      label: const Text('Login'),
                      onPressed: () async{
                        Navigator.of(context).pushNamed("/login");
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
