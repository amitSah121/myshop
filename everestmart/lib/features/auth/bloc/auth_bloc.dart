
import 'package:flutter_bloc/flutter_bloc.dart';
import 'auth_event.dart';
import 'auth_state.dart';
import '../domain/repositories/auth_repository.dart';
import '../../../core/error/failures.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc(this.authRepository) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheck);
    on<AuthLoginRequested>(_onLogin);
    
    on<AuthGoogleLoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        await authRepository.loginWithGoogle(event.idToken);
        final user = await authRepository.getMe();
        emit(AuthAuthenticated(user));
      } catch (e) {
        emit(AuthFailureState(e.toString()));
      }
    });

    on<AuthRegisterRequested>(_onRegister);



    on<AuthLogoutRequested>(_onLogout);
  }

  Future<void> _onRegister(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());


    try {
      await authRepository.register(
        name: event.name,
        email: event.email,
        password: event.password,
      );

      final user = await authRepository.getMe();
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(_mapError(e));
    }
  }


  Future<void> _onAuthCheck(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final loggedIn = await authRepository.isLoggedIn();
    if (!loggedIn) {
      emit(AuthUnauthenticated());
      return;
    }

    try {
      final user = await authRepository.getMe();
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLogin(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      await authRepository.login(
        event.email,
        event.password,
      );

      final user = await authRepository.getMe();
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(_mapError(e));
    }
  }

  

  Future<void> _onLogout(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    await authRepository.logout();
    emit(AuthUnauthenticated());
  }

  AuthFailureState _mapError(Object e) {
    if (e is Failure) {
      return AuthFailureState(e.message);
    }
    return const AuthFailureState('Something went wrong');
  }
}
