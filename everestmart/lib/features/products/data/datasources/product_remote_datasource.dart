import 'package:everestmart/core/network/api_endpoints.dart';
import 'package:everestmart/core/network/dio_client.dart';

abstract class ProductRemoteDataSource {
  // Public
  Future<List<Map<String, dynamic>>> getProducts(
    Map<String, String> query,
  );

  Future<Map<String, dynamic>> getProductById(String productId);

}



class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final DioClient api;

  ProductRemoteDataSourceImpl(this.api);

  // ========================
  // Public
  // ========================

  @override
  Future<List<Map<String, dynamic>>> getProducts(
    Map<String, String> query,
  ) async {
    final response = await api.get(
      ApiEndpoints.products,
      query: query.isEmpty ? null : query,
    );

    return (response as List)
        .cast<Map<String, dynamic>>();
  }

  @override
  Future<Map<String, dynamic>> getProductById(
    String productId,
  ) async {
    final response = await api.get(
      ApiEndpoints.productById(productId),
    );
    return response as Map<String, dynamic>;
  }


}
