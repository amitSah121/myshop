import '../entities/payment_result.dart';

abstract class PaymentRepository {
  Future<PaymentResult> makePayment({
    required String orderId,
    required double amount,
    required String method, // cod | khalti | esewa | card
    required String customerPhone,
  });
}
