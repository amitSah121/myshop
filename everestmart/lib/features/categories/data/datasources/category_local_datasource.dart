import 'package:everestmart/core/storage/hive_boxes.dart';
import 'package:hive_flutter/hive_flutter.dart';

abstract class CategoryLocalDataSource {
  Future<void> cacheCategories(List<Map<String, dynamic>> categories);
  Future<List<Map<String, dynamic>>?> getCachedCategories();
  Future<void> clear();
}



class CategoryLocalDataSourceImpl implements CategoryLocalDataSource {
  final Box box = HiveBoxes.settingsBox; 
  // or create a dedicated category box later
  

  static const _key = 'cached_categories';

  @override
  Future<void> cacheCategories(List<Map<String, dynamic>> categories) async {
    await box.put(_key, categories);
  }

  @override
  Future<List<Map<String, dynamic>>?> getCachedCategories() async {
    final data = box.get(_key);
    if (data == null) return null;
    return List<Map<String, dynamic>>.from(data);
  }

  @override
  Future<void> clear() async {
    await box.delete(_key);
  }
}

