import '../entities/category.dart';

abstract class CategoryRepository {
  /// Public (customers)
  Future<List<Category>> getActiveCategories();

}
