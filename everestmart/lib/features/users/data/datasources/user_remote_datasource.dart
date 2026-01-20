abstract class UserRemoteDataSource {
  Future<Map<String, dynamic>> getProfile(String token);
  Future<Map<String, dynamic>> updateProfile(
    String token,
    Map<String, dynamic> body,
  );

  Future<Map<String, dynamic>> addAddress(
    String token,
    Map<String, dynamic> body,
  );

  Future<void> deleteAddress(String token, String addressId);
  Future<Map<String, dynamic>> setDefaultAddress(
    String token,
    String addressId,
  );

  Future<Map<String, dynamic>> addToCart(
    String token,
    String productId,
    int quantity,
  );

  Future<Map<String, dynamic>> removeFromCart(
    String token,
    String productId,
  );

  Future<Map<String, dynamic>> addToWishlist(
    String token,
    String productId,
  );

  Future<Map<String, dynamic>> removeFromWishlist(
    String token,
    String productId,
  );
}
