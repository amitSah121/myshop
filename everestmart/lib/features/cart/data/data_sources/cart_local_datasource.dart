import 'package:hive/hive.dart';
import '../models/cart_item_model.dart';
import '../../../../core/storage/hive_boxes.dart';

abstract class CartLocalDataSource {
  Future<void> cacheCart(List<CartItemModel> items);
  Future<List<CartItemModel>> getCachedCart();
  Future<void> clear();
}


class CartLocalDataSourceImpl implements CartLocalDataSource {
  @override
  Future<void> cacheCart(List<CartItemModel> items) async {
    final box = Hive.box(HiveBoxes.cart);
    await box.put('cart', items.map((e) => e.toJson()).toList());
  }

  @override
  Future<List<CartItemModel>> getCachedCart() async {
    final box = Hive.box(HiveBoxes.cart);
    final data = box.get('cart');

    if (data == null) return [];

    return (data as List)
        .map((e) => CartItemModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  @override
  Future<void> clear() async {
    final box = Hive.box(HiveBoxes.cart);
    await box.delete('cart');
  }
}
