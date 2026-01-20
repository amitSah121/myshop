class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String category;
  final String image;
  final int stock;
  final String unit;
  final double unitQuantity;
  final DateTime createdAt;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.image,
    required this.stock,
    required this.unit,
    required this.unitQuantity,
    required this.createdAt,
  });

  bool get inStock => stock > 0;
}
