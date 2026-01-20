import '../../domain/entities/product.dart';

class ProductModel extends Product {
  const ProductModel({
    required super.id,
    required super.name,
    required super.description,
    required super.price,
    required super.category,
    required super.image,
    required super.stock,
    required super.unit,
    required super.unitQuantity,
    required super.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['_id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      category: json['category'],
      image: json['image'],
      stock: json['stock'] ?? 0,
      unit: json['unit'],
      unitQuantity: (json['unitQuantity'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
