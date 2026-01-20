import 'payment_gateway.dart';
import '../../domain/entities/payment_result.dart';

class EsewaGateway implements PaymentGateway {
  @override
  Future<PaymentResult> pay({
    required String orderId,
    required double amount,
    required String customerPhone,
  }) async {
    try {
      // TODO: Integrate eSewa SDK / WebView

      return PaymentResult.success(
        method: 'esewa',
        transactionId: 'ESEWA_TXN_ID',
      );
    } catch (e) {
      return PaymentResult.failure(
        method: 'esewa',
        errorMessage: 'eSewa payment failed',
      );
    }
  }
}
