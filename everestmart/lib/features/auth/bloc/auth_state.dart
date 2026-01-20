import 'package:equatable/equatable.dart';
import 'package:everestmart/features/auth/domain/entities/auth_user.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class AuthInitial extends AuthState {}

/// Checking local auth
class AuthLoading extends AuthState {}

/// Logged in
class AuthAuthenticated extends AuthState {
  final AuthUser user;

  const AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

/// Logged out
class AuthUnauthenticated extends AuthState {}

/// Failure
class AuthFailureState extends AuthState {
  final String message;

  const AuthFailureState(this.message);

  @override
  List<Object?> get props => [message];
}
