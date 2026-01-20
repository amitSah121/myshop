import '../entities/product.dart';
import '../entities/product_query.dart';

abstract class ProductRepository {
  // Public
  Future<List<Product>> getProducts(ProductQuery query);
  Future<Product> getProductById(String productId);

}
