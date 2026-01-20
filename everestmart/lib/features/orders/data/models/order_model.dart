import '../../domain/entities/order.dart';
import 'order_item_model.dart';
import 'order_tracking_model.dart';

class OrderModel extends Order {
  const OrderModel({
    required super.id,
    required super.userId,
    required super.items,
    required super.shippingAddressId,
    required super.totalAmount,
    required super.deliveryCharges,
    required super.paymentMethod,
    required super.paymentStatus,
    required super.orderStatus,
    super.riderId,
    required super.otpVerified,
    super.otpVerifiedAt,
    super.cancelledAt,
    super.cancellationReason,
    super.cancelledBy,
    required super.tracking,
    required super.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['_id'],
      userId: json['user'],
      items: (json['items'] as List)
          .map((e) => OrderItemModel.fromJson(e))
          .toList(),
      shippingAddressId: json['shippingAddress'],
      totalAmount: (json['totalAmount'] as num).toDouble(),
      deliveryCharges:
          (json['deliveryCharges'] as num?)?.toDouble() ?? 0,
      paymentMethod: json['paymentMethod'],
      paymentStatus: json['paymentStatus'],
      orderStatus: json['orderStatus'],
      riderId: json['rider'],
      otpVerified: json['otpVerified'] ?? false,
      otpVerifiedAt: json['otpVerifiedAt'] != null
          ? DateTime.parse(json['otpVerifiedAt'])
          : null,
      cancelledAt: json['cancelledAt'] != null
          ? DateTime.parse(json['cancelledAt'])
          : null,
      cancellationReason: json['cancellationReason'],
      cancelledBy: json['cancelledBy'],
      tracking:
          OrderTrackingModel.fromJson(json['tracking']),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
