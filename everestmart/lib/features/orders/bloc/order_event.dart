import 'package:equatable/equatable.dart';
import 'package:everestmart/features/orders/domain/entities/order_item.dart';

abstract class OrderEvent extends Equatable {
  const OrderEvent();

  @override
  List<Object?> get props => [];
}

// ----------------------------

class PlaceOrderEvent extends OrderEvent {
  final List<OrderItem> items;
  final String addressId;
  final String paymentMethod;
  final String token;

  const PlaceOrderEvent({
    required this.items,
    required this.addressId,
    required this.paymentMethod,
    required this.token
  });

  @override
  List<Object?> get props => [items, addressId, paymentMethod, token];
}

// ----------------------------

class FetchMyOrdersEvent extends OrderEvent {

  final String token;

  const FetchMyOrdersEvent(this.token);

  @override
  List<Object?> get props => [token];
}

// ----------------------------

class FetchOrderByIdEvent extends OrderEvent {
  final String orderId;
  final String token;

  const FetchOrderByIdEvent(this.orderId, this.token);

  @override
  List<Object?> get props => [orderId, token];
}

// ----------------------------

class CancelOrderEvent extends OrderEvent {
  final String orderId;
  final String reason;
  final String token;

  const CancelOrderEvent({
    required this.orderId,
    required this.reason,
    required this.token
  });

  @override
  List<Object?> get props => [orderId, reason, token];
}
