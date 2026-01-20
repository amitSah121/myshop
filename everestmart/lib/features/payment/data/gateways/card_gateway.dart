import 'payment_gateway.dart';
import '../../domain/entities/payment_result.dart';

class CardGateway implements PaymentGateway {
  @override
  Future<PaymentResult> pay({
    required String orderId,
    required double amount,
    required String customerPhone,
  }) async {
    try {
      // TODO: Integrate card payment processor

      return PaymentResult.success(
        method: 'card',
        transactionId: 'CARD_TXN_ID',
      );
    } catch (e) {
      return PaymentResult.failure(
        method: 'card',
        errorMessage: 'Card payment failed',
      );
    }
  }
}
