import 'package:everestmart/core/network/api_client.dart';
import '../models/cart_item_model.dart';

abstract class CartRemoteDataSource {
  Future<List<CartItemModel>> fetchCart();
  Future<void> addToCart(String productId, int quantity);
  Future<void> updateQuantity(String productId, int quantity);
  Future<void> removeFromCart(String productId);
  Future<void> clearCart();
}


class CartRemoteDataSourceImpl implements CartRemoteDataSource {
  final ApiClient api;

  CartRemoteDataSourceImpl(this.api);

  @override
  Future<List<CartItemModel>> fetchCart() async {
    final response = await api.get('/users/me/cart');
    return (response as List)
        .map((e) => CartItemModel.fromJson(e))
        .toList();
  }

  @override
  Future<void> addToCart(String productId, int quantity) async {
    await api.post('/users/me/cart', {
      'productId': productId,
      'quantity': quantity,
    });
  }

  @override
  Future<void> updateQuantity(String productId, int quantity) async {
    await api.put('/users/me/cart', {
      'productId': productId,
      'quantity': quantity,
    });
  }

  @override
  Future<void> removeFromCart(String productId) async {
    await api.delete('/users/me/cart/$productId');
  }

  @override
  Future<void> clearCart() async {
    await api.delete('/users/me/cart');
  }
}
