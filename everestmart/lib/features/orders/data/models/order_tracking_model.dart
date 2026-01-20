import '../../domain/entities/order_tracking.dart';

class OrderTrackingModel extends OrderTracking {
  const OrderTrackingModel({
    super.acceptedAt,
    super.pickedUpAt,
    super.deliveredAt,
  });

  factory OrderTrackingModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const OrderTrackingModel();
    }

    return OrderTrackingModel(
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.parse(json['acceptedAt'])
          : null,
      pickedUpAt: json['pickedUpAt'] != null
          ? DateTime.parse(json['pickedUpAt'])
          : null,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.parse(json['deliveredAt'])
          : null,
    );
  }
}
