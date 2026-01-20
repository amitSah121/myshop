import 'package:everestmart/features/users/domain/repositories/user_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'user_event.dart';
import 'user_states.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository repository;

  UserBloc(this.repository) : super(UserInitial()) {
    on<LoadUserProfile>(_loadProfile);
    on<UpdateUserProfile>(_updateProfile);
    on<AddAddressEvent>(_addAddress);
    on<DeleteAddressEvent>(_deleteAddress);
    on<SetDefaultAddressEvent>(_setDefaultAddress);
    on<AddToWishlistEvent>(_addToWishlist);
    on<RemoveFromWishlistEvent>(_removeFromWishlist);
    on<AddToUserCartEvent>(_addToCart);
    on<RemoveFromUserCartEvent>(_removeFromCart);
  }

  // ----------------------------

  Future<void> _loadProfile(
    LoadUserProfile event,
    Emitter<UserState> emit,
  ) async {
    emit(UserLoading());
    try {
      final user = await repository.getProfile();
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _updateProfile(
    UpdateUserProfile event,
    Emitter<UserState> emit,
  ) async {
    emit(UserLoading());
    try {
      final user = await repository.updateProfile(
        name: event.name,
        phone: event.phone,
      );
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  // ----------------------------
  // Address
  // ----------------------------

  Future<void> _addAddress(
    AddAddressEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      await repository.addAddress(event.address);
      final user = await repository.getProfile();
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _deleteAddress(
    DeleteAddressEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      await repository.deleteAddress(event.addressId);
      final user = await repository.getProfile();
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _setDefaultAddress(
    SetDefaultAddressEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      await repository.setDefaultAddress(event.addressId);
      final user = await repository.getProfile();
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  // ----------------------------
  // Wishlist
  // ----------------------------

  Future<void> _addToWishlist(
    AddToWishlistEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      final user = await repository.addToWishlist(event.productId);
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _removeFromWishlist(
    RemoveFromWishlistEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      final user =
          await repository.removeFromWishlist(event.productId);
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  // ----------------------------
  // Cart (user-side)
  // ----------------------------

  Future<void> _addToCart(
    AddToUserCartEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      final user =
          await repository.addToCart(event.productId, event.quantity);
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }

  Future<void> _removeFromCart(
    RemoveFromUserCartEvent event,
    Emitter<UserState> emit,
  ) async {
    try {
      final user =
          await repository.removeFromCart(event.productId);
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }
}
