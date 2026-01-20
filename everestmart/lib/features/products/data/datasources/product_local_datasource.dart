import 'dart:convert';

abstract class ProductLocalDataSource {
  Future<void> cacheProducts(
    String cacheKey,
    List<Map<String, dynamic>> products,
  );

  Future<List<Map<String, dynamic>>?> getCachedProducts(
    String cacheKey,
  );

  Future<void> clear();
}


class ProductLocalDataSourceImpl implements ProductLocalDataSource {
  static const _prefix = 'CACHED_PRODUCTS_';
  
  get SharedPreferences => null;

  @override
  Future<void> cacheProducts(
    String cacheKey,
    List<Map<String, dynamic>> products,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(products);
    await prefs.setString('$_prefix$cacheKey', jsonString);
  }

  @override
  Future<List<Map<String, dynamic>>?> getCachedProducts(
    String cacheKey,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString('$_prefix$cacheKey');

    if (jsonString == null) return null;

    final decoded = jsonDecode(jsonString) as List;
    return decoded.cast<Map<String, dynamic>>();
  }

  @override
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    final keys =
        prefs.getKeys().where((k) => k.startsWith(_prefix)).toList();
    for (final k in keys) {
      await prefs.remove(k);
    }
  }
}

