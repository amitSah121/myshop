import 'package:everestmart/features/cart/data/data_sources/cart_local_datasource.dart';
import 'package:everestmart/features/cart/data/data_sources/cart_remote_datasource.dart';

import '../../domain/entities/cart_item.dart';
import '../../domain/repositories/cart_repository.dart';

class CartRepositoryImpl implements CartRepository {
  final CartRemoteDataSource remote;
  final CartLocalDataSource local;

  CartRepositoryImpl({
    required this.remote,
    required this.local,
  });

  @override
  Future<List<CartItem>> getCart() async {
    final items = await remote.fetchCart();
    await local.cacheCart(items);
    return items;
  }

  @override
  Future<void> addToCart({
    required String productId,
    int quantity = 1,
  }) async {
    await remote.addToCart(productId, quantity);
  }

  @override
  Future<void> updateQuantity({
    required String productId,
    required int quantity,
  }) async {
    await remote.updateQuantity(productId, quantity);
  }

  @override
  Future<void> removeFromCart(String productId) async {
    await remote.removeFromCart(productId);
  }

  @override
  Future<void> clearCart() async {
    await remote.clearCart();
    await local.clear();
  }
}
