import '../entities/order.dart';
import '../entities/order_item.dart';

abstract class OrderRepository {
  // Customer
  Future<Order> placeOrder({
    required List<OrderItem> items,
    required String addressId,
    required String paymentMethod,
    required String token,
  });

  Future<List<Order>> getMyOrders(String token,);
  Future<Order> getOrderById(String orderId, String token,);

  Future<Order> cancelOrder(
    String orderId, {
    required String reason,
    required String token,
  });

  // Admin
  Future<List<Order>> getAllOrders(String token,);
  // Future<Order> updateOrderStatus(
  //   String orderId,
  //   String status,
  // );
}
