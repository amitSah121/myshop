import '../../domain/entities/product.dart';
import '../../domain/entities/product_query.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_datasource.dart';
import '../datasources/product_local_datasource.dart';
import '../models/product_model.dart';
import '../models/product_query_model.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remote;
  final ProductLocalDataSource local;
  final String? token;

  ProductRepositoryImpl({
    required this.remote,
    required this.local,
    this.token,
  });

  @override
  Future<List<Product>> getProducts(ProductQuery query) async {
    final queryMap = ProductQueryModel.toQuery(query);
    final cacheKey = queryMap.toString();

    final cached = await local.getCachedProducts(cacheKey);
    if (cached != null) {
      return cached.map(ProductModel.fromJson).toList();
    }

    final data = await remote.getProducts(queryMap);
    await local.cacheProducts(cacheKey, data);

    return data.map(ProductModel.fromJson).toList();
  }

  @override
  Future<Product> getProductById(String productId) async {
    final data = await remote.getProductById(productId);
    return ProductModel.fromJson(data);
  }

}
