import 'package:dio/dio.dart';
import 'package:everestmart/core/network/api_endpoints.dart';

abstract class CategoryRemoteDataSource {
  // Public
  Future<List<Map<String, dynamic>>> getActiveCategories();

}



class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  final Dio dio;

  CategoryRemoteDataSourceImpl(this.dio);

  // ---------- PUBLIC ----------

  @override
  Future<List<Map<String, dynamic>>> getActiveCategories() async {
    final response = await dio.get(
      '${ApiEndpoints.baseUrl}/categories',
    );

    final data = response.data;
    return List<Map<String, dynamic>>.from(data);
  }
}



