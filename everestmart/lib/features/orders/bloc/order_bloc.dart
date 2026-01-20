import 'package:everestmart/features/orders/domain/repositories/order_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final OrderRepository repository;

  OrderBloc(this.repository) : super(OrderInitial()) {
    on<PlaceOrderEvent>(_placeOrder);
    on<FetchMyOrdersEvent>(_fetchMyOrders);
    on<FetchOrderByIdEvent>(_fetchOrderById);
    on<CancelOrderEvent>(_cancelOrder);
  }

  // ----------------------------

  Future<void> _placeOrder(
    PlaceOrderEvent event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());
    try {
      final order = await repository.placeOrder(
        items: event.items,
        addressId: event.addressId,
        paymentMethod: event.paymentMethod,
        token: event.token
      );
      emit(OrderPlaced(order));
    } catch (e) {
      emit(OrderError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _fetchMyOrders(
    FetchMyOrdersEvent event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());
    try {
      final orders = await repository.getMyOrders(event.token);
      emit(OrdersLoaded(orders));
    } catch (e) {
      emit(OrderError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _fetchOrderById(
    FetchOrderByIdEvent event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());
    try {
      final order = await repository.getOrderById(event.orderId, event.token);
      emit(OrderLoaded(order));
    } catch (e) {
      emit(OrderError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _cancelOrder(
    CancelOrderEvent event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());
    try {
      final order = await repository.cancelOrder(
        event.orderId,
        reason: event.reason,
        token: event.token
      );
      emit(OrderCancelled(order));
    } catch (e) {
      emit(OrderError(e.toString()));
    }
  }
}
