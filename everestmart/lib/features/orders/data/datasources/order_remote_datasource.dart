import 'package:everestmart/core/network/api_client.dart';
import 'package:everestmart/core/network/api_endpoints.dart';

abstract class OrderRemoteDataSource {
  // Customer
  Future<Map<String, dynamic>> placeOrder(
    String token,
    Map<String, dynamic> body,
  );

  Future<List<Map<String, dynamic>>> getMyOrders(
    String token,
  );

  Future<Map<String, dynamic>> getOrderById(
    String token,
    String orderId,
  );

  Future<Map<String, dynamic>> cancelOrder(
    String token,
    String orderId,
    Map<String, dynamic> body,
  );

  // Admin
  Future<List<Map<String, dynamic>>> getAllOrders(
    String token,
  );

  // Future<Map<String, dynamic>> updateOrderStatus(
  //   String token,
  //   String orderId,
  //   Map<String, dynamic> body,
  // );
}



class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final ApiClient api;

  OrderRemoteDataSourceImpl(this.api);

  // ============================
  // Customer
  // ============================

  @override
  Future<Map<String, dynamic>> placeOrder(
    String token,
    Map<String, dynamic> body,
  ) async {
    final response = await api.post(
      ApiEndpoints.placeOrder,
      body,
    );
    return response as Map<String, dynamic>;
  }

  @override
  Future<List<Map<String, dynamic>>> getMyOrders(String token) async {
    final response = await api.get(
      ApiEndpoints.orders,
    );

    return List<Map<String, dynamic>>.from(response);
  }

  @override
  Future<Map<String, dynamic>> getOrderById(
    String token,
    String orderId,
  ) async {
    final response = await api.get(
      ApiEndpoints.orderById(orderId),
    );
    return response as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> cancelOrder(
    String token,
    String orderId,
    Map<String, dynamic> body,
  ) async {
    final response = await api.put(
      ApiEndpoints.cancelOrder(orderId),
      body,
    );
    return response as Map<String, dynamic>;
  }

  // ============================
  // Admin
  // ============================

  @override
  Future<List<Map<String, dynamic>>> getAllOrders(String token) async {
    final response = await api.get(
      ApiEndpoints.orders,
    );

    return List<Map<String, dynamic>>.from(response);
  }
}