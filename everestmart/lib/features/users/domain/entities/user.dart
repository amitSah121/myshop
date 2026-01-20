import 'address.dart';
import 'cart_item.dart';
import 'wishlist_item.dart';

class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final bool isAdmin;
  final bool isBlocked;

  final List<Address> addresses;
  final List<CartItem> cart;
  final List<WishlistItem> wishlist;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.isAdmin,
    required this.isBlocked,
    required this.addresses,
    required this.cart,
    required this.wishlist,
  });
}
