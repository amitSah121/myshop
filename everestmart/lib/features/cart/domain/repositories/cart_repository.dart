import '../entities/cart_item.dart';

abstract class CartRepository {
  Future<List<CartItem>> getCart();

  Future<void> addToCart({
    required String productId,
    int quantity = 1,
  });

  Future<void> updateQuantity({
    required String productId,
    required int quantity,
  });

  Future<void> removeFromCart(String productId);

  Future<void> clearCart();
}
