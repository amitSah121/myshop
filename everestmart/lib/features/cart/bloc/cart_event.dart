import 'package:equatable/equatable.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

// ----------------------------

class LoadCartEvent extends CartEvent {}

// ----------------------------

class AddToCartEvent extends CartEvent {
  final String productId;
  final int quantity;

  const AddToCartEvent({
    required this.productId,
    this.quantity = 1,
  });

  @override
  List<Object?> get props => [productId, quantity];
}

// ----------------------------

class UpdateCartQuantityEvent extends CartEvent {
  final String productId;
  final int quantity;

  const UpdateCartQuantityEvent({
    required this.productId,
    required this.quantity,
  });

  @override
  List<Object?> get props => [productId, quantity];
}

// ----------------------------

class RemoveFromCartEvent extends CartEvent {
  final String productId;

  const RemoveFromCartEvent(this.productId);

  @override
  List<Object?> get props => [productId];
}

// ----------------------------

class ClearCartEvent extends CartEvent {}
