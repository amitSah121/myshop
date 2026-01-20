import '../../domain/entities/payment_result.dart';

abstract class PaymentGateway {
  Future<PaymentResult> pay({
    required String orderId,
    required double amount,
    required String customerPhone,
  });
}
