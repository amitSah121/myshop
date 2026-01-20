import '../entities/user.dart';
import '../entities/address.dart';

abstract class UserRepository {
  Future<User> getProfile();

  Future<User> updateProfile({
    required String name,
    String? phone,
  });

  // Addresses
  Future<List<Address>> getAddresses();
  Future<Address> addAddress(Address address);
  Future<void> deleteAddress(String addressId);
  Future<Address> setDefaultAddress(String addressId);

  // Cart
  Future<User> addToCart(String productId, int quantity);
  Future<User> removeFromCart(String productId);

  // Wishlist
  Future<User> addToWishlist(String productId);
  Future<User> removeFromWishlist(String productId);
}
