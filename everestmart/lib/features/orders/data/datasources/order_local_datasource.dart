import 'package:hive_flutter/hive_flutter.dart';

abstract class OrderLocalDataSource {
  Future<void> cacheOrders(List<Map<String, dynamic>> orders);
  Future<List<Map<String, dynamic>>?> getCachedOrders();
  Future<void> clear();
}


class OrderLocalDataSourceImpl implements OrderLocalDataSource {
  final Box box;

  static const String _cacheKey = 'cached_orders';

  OrderLocalDataSourceImpl(this.box);

  @override
  Future<void> cacheOrders(List<Map<String, dynamic>> orders) async {
    await box.put(_cacheKey, orders);
  }

  @override
  Future<List<Map<String, dynamic>>?> getCachedOrders() async {
    final data = box.get(_cacheKey);

    if (data == null) return null;

    return List<Map<String, dynamic>>.from(data);
  }

  @override
  Future<void> clear() async {
    await box.delete(_cacheKey);
  }
}
