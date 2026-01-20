import '../../domain/entities/user.dart';
import 'address_model.dart';
import 'cart_item_model.dart';
import 'wishlist_item_model.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    super.phone,
    required super.isAdmin,
    required super.isBlocked,
    required super.addresses,
    required super.cart,
    required super.wishlist,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      isAdmin: json['isAdmin'] ?? false,
      isBlocked: json['isBlocked'] ?? false,
      addresses: (json['addresses'] as List? ?? [])
          .map((e) => AddressModel.fromJson(e))
          .toList(),
      cart: (json['cart'] as List? ?? [])
          .map((e) => CartItemModel.fromJson(e))
          .toList(),
      wishlist: (json['wishlist'] as List? ?? [])
          .map((e) => WishlistItemModel.fromJson(e))
          .toList(),
    );
  }
}
