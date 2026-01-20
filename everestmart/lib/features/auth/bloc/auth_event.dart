import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// App started → check token
class AuthCheckRequested extends AuthEvent {}

/// Email/password login
class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested(this.email, this.password);

  @override
  List<Object?> get props => [email, password];
}

/// Google sign-in
class AuthGoogleLoginRequested extends AuthEvent {
  final String idToken;
  const AuthGoogleLoginRequested(this.idToken);
}

/// Logout
class AuthLogoutRequested extends AuthEvent {}


class AuthRegisterRequested extends AuthEvent {
  final String name;
  final String email;
  final String password;

  const AuthRegisterRequested(
    this.name,
    this.email,
    this.password,
  );

  @override
  List<Object?> get props => [name, email, password];
}