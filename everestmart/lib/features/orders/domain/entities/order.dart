import 'order_item.dart';
import 'order_tracking.dart';

class Order {
  final String id;
  final String userId;
  final List<OrderItem> items;

  final String shippingAddressId;
  final double totalAmount;
  final double deliveryCharges;

  final String paymentMethod; // COD | Online
  final String paymentStatus; // Pending | paid | failed
  final String orderStatus;

  final String? riderId;

  // OTP (read-only here)
  final bool otpVerified;
  final DateTime? otpVerifiedAt;

  // Cancellation
  final DateTime? cancelledAt;
  final String? cancellationReason;
  final String? cancelledBy;

  final OrderTracking tracking;
  final DateTime createdAt;

  const Order({
    required this.id,
    required this.userId,
    required this.items,
    required this.shippingAddressId,
    required this.totalAmount,
    required this.deliveryCharges,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.orderStatus,
    this.riderId,
    required this.otpVerified,
    this.otpVerifiedAt,
    this.cancelledAt,
    this.cancellationReason,
    this.cancelledBy,
    required this.tracking,
    required this.createdAt,
  });

  bool get isCancellable =>
      orderStatus == 'pending' || orderStatus == 'confirmed';
}
