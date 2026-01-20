import '../../domain/entities/product_query.dart';

class ProductQueryModel {
  static Map<String, String> toQuery(ProductQuery query) {
    final map = <String, String>{};

    if (query.search != null) map['search'] = query.search!;
    if (query.category != null) map['category'] = query.category!;
    if (query.minPrice != null) map['minPrice'] = query.minPrice.toString();
    if (query.maxPrice != null) map['maxPrice'] = query.maxPrice.toString();
    if (query.inStock != null) map['inStock'] = query.inStock.toString();

    map['page'] = query.page.toString();
    map['limit'] = query.limit.toString();

    return map;
  }
}
