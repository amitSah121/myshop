import 'package:equatable/equatable.dart';
import 'package:everestmart/features/users/domain/entities/address.dart';

abstract class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object?> get props => [];
}

// ----------------------------

class LoadUserProfile extends UserEvent {}

// ----------------------------

class UpdateUserProfile extends UserEvent {
  final String name;
  final String? phone;

  const UpdateUserProfile({
    required this.name,
    this.phone,
  });

  @override
  List<Object?> get props => [name, phone];
}

// ----------------------------
// Address
// ----------------------------

class AddAddressEvent extends UserEvent {
  final Address address;

  const AddAddressEvent(this.address);

  @override
  List<Object?> get props => [address];
}

class DeleteAddressEvent extends UserEvent {
  final String addressId;

  const DeleteAddressEvent(this.addressId);

  @override
  List<Object?> get props => [addressId];
}

class SetDefaultAddressEvent extends UserEvent {
  final String addressId;

  const SetDefaultAddressEvent(this.addressId);

  @override
  List<Object?> get props => [addressId];
}

// ----------------------------
// Wishlist
// ----------------------------

class AddToWishlistEvent extends UserEvent {
  final String productId;

  const AddToWishlistEvent(this.productId);

  @override
  List<Object?> get props => [productId];
}

class RemoveFromWishlistEvent extends UserEvent {
  final String productId;

  const RemoveFromWishlistEvent(this.productId);

  @override
  List<Object?> get props => [productId];
}

// ----------------------------
// Cart (user-side)
// ----------------------------

class AddToUserCartEvent extends UserEvent {
  final String productId;
  final int quantity;

  const AddToUserCartEvent(this.productId, this.quantity);

  @override
  List<Object?> get props => [productId, quantity];
}

class RemoveFromUserCartEvent extends UserEvent {
  final String productId;

  const RemoveFromUserCartEvent(this.productId);

  @override
  List<Object?> get props => [productId];
}
