class ProductQuery {
  final String? search;
  final String? category;
  final double? minPrice;
  final double? maxPrice;
  final bool? inStock;
  final int page;
  final int limit;

  const ProductQuery({
    this.search,
    this.category,
    this.minPrice,
    this.maxPrice,
    this.inStock,
    this.page = 1,
    this.limit = 20,
  });

  ProductQuery copyWith({
    String? search,
    String? category,
    double? minPrice,
    double? maxPrice,
    bool? inStock,
    int? page,
    int? limit,
  }) {
    return ProductQuery(
      search: search ?? this.search,
      category: category ?? this.category,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      inStock: inStock ?? this.inStock,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }
  
}
