import '../../domain/entities/category.dart';
import '../../domain/repositories/category_repository.dart';
import '../datasources/category_remote_datasource.dart';
import '../datasources/category_local_datasource.dart';
import '../models/category_model.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final CategoryRemoteDataSource remote;
  final CategoryLocalDataSource local;
  final String? token; // null for public users

  CategoryRepositoryImpl({
    required this.remote,
    required this.local,
    this.token,
  });

  @override
  Future<List<Category>> getActiveCategories() async {
    final cached = await local.getCachedCategories();
    if (cached != null) {
      return cached.map(CategoryModel.fromJson).toList();
    }

    final data = await remote.getActiveCategories();
    await local.cacheCategories(data);

    return data.map(CategoryModel.fromJson).toList();
  }

}
