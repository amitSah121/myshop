import '../../domain/entities/order.dart';
import '../../domain/entities/order_item.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';
import '../datasources/order_local_datasource.dart';
import '../models/order_model.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remote;
  final OrderLocalDataSource local;

  OrderRepositoryImpl({
    required this.remote,
    required this.local,
  });

  @override
  Future<Order> placeOrder({
    required List<OrderItem> items,
    required String addressId,
    required String paymentMethod,
    required String token,
  }) async {
    final data = await remote.placeOrder(token, {
      'items': items
          .map((e) => {
                'product': e.productId,
                'quantity': e.quantity,
                'price': e.price,
              })
          .toList(),
      'shippingAddress': addressId,
      'paymentMethod': paymentMethod,
    });

    await local.clear();
    return OrderModel.fromJson(data);
  }

  @override
  Future<List<Order>> getMyOrders( String token,) async {
    final cached = await local.getCachedOrders();
    if (cached != null) {
      return cached.map(OrderModel.fromJson).toList();
    }

    final data = await remote.getMyOrders(token);
    await local.cacheOrders(data);

    return data.map(OrderModel.fromJson).toList();
  }

  @override
  Future<Order> getOrderById(String orderId,  String token,) async {
    final data = await remote.getOrderById(token, orderId);
    return OrderModel.fromJson(data);
  }

  @override
  Future<Order> cancelOrder(
    String orderId, {
    required String reason,
    required String token,
  }) async {
    final data = await remote.cancelOrder(
      token,
      orderId,
      {'reason': reason},
    );

    await local.clear();
    return OrderModel.fromJson(data);
  }

  @override
  Future<List<Order>> getAllOrders( String token,) async {
    final data = await remote.getAllOrders(token);
    return data.map(OrderModel.fromJson).toList();
  }

  // @override
  // Future<Order> updateOrderStatus(
  //   String orderId,
  //   String status,
  // ) async {
  //   final data = await remote.updateOrderStatus(
  //     token,
  //     orderId,
  //     {'status': status},
  //   );

  //   await local.clear();
  //   return OrderModel.fromJson(data);
  // }
}
