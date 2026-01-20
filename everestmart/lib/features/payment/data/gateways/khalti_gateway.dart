import 'payment_gateway.dart';
import '../../domain/entities/payment_result.dart';

class KhaltiGateway implements PaymentGateway {
  @override
  Future<PaymentResult> pay({
    required String orderId,
    required double amount,
    required String customerPhone,
  }) async {
    try {
      // TODO: Integrate Khalti SDK / WebView later

      return PaymentResult.success(
        method: 'khalti',
        transactionId: 'KHALTI_TXN_ID',
      );
    } catch (e) {
      return PaymentResult.failure(
        method: 'khalti',
        errorMessage: 'Khalti payment failed',
      );
    }
  }
}
