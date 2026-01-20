import 'package:everestmart/features/cart/domain/repositories/cart_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  final CartRepository repository;

  CartBloc(this.repository) : super(CartInitial()) {
    on<LoadCartEvent>(_loadCart);
    on<AddToCartEvent>(_addToCart);
    on<UpdateCartQuantityEvent>(_updateQuantity);
    on<RemoveFromCartEvent>(_removeFromCart);
    on<ClearCartEvent>(_clearCart);
  }

  // ----------------------------

  Future<void> _loadCart(
    LoadCartEvent event,
    Emitter<CartState> emit,
  ) async {
    emit(CartLoading());
    try {
      final items = await repository.getCart();
      emit(CartLoaded(items));
    } catch (e) {
      emit(CartError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _addToCart(
    AddToCartEvent event,
    Emitter<CartState> emit,
  ) async {
    try {
      await repository.addToCart(
        productId: event.productId,
        quantity: event.quantity,
      );

      final items = await repository.getCart();
      emit(CartLoaded(items));
    } catch (e) {
      emit(CartError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _updateQuantity(
    UpdateCartQuantityEvent event,
    Emitter<CartState> emit,
  ) async {
    try {
      await repository.updateQuantity(
        productId: event.productId,
        quantity: event.quantity,
      );

      final items = await repository.getCart();
      emit(CartLoaded(items));
    } catch (e) {
      emit(CartError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _removeFromCart(
    RemoveFromCartEvent event,
    Emitter<CartState> emit,
  ) async {
    try {
      await repository.removeFromCart(event.productId);

      final items = await repository.getCart();
      emit(CartLoaded(items));
    } catch (e) {
      emit(CartError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _clearCart(
    ClearCartEvent event,
    Emitter<CartState> emit,
  ) async {
    try {
      await repository.clearCart();
      emit(const CartLoaded([]));
    } catch (e) {
      emit(CartError(e.toString()));
    }
  }
}
