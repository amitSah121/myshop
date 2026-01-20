import 'payment_gateway.dart';
import '../../domain/entities/payment_result.dart';

class CodGateway implements PaymentGateway {
  @override
  Future<PaymentResult> pay({
    required String orderId,
    required double amount,
    required String customerPhone,
  }) async {
    // No external call needed
    return PaymentResult.success(
      method: 'COD',
    );
  }
}
