import '../../domain/entities/order_item.dart';

class OrderItemModel extends OrderItem {
  const OrderItemModel({
    required super.productId,
    required super.quantity,
    required super.price,
    required super.name
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productId: json['product'],
      quantity: json['quantity'],
      price: (json['price'] as num).toDouble(),
      name: json["name"]
    );
  }
}
