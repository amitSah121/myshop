import '../../domain/entities/payment_result.dart';
import '../../domain/repositories/payment_repository.dart';
import '../gateways/payment_gateway.dart';
import '../gateways/cod_gateway.dart';
import '../gateways/khalti_gateway.dart';
import '../gateways/esewa_gateway.dart';
import '../gateways/card_gateway.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final Map<String, PaymentGateway> _gateways = {
    'cod': CodGateway(),
    'khalti': KhaltiGateway(),
    'esewa': EsewaGateway(),
    'card': CardGateway(),
  };

  @override
  Future<PaymentResult> makePayment({
    required String orderId,
    required double amount,
    required String method,
    required String customerPhone,
  }) async {
    final gateway = _gateways[method.toLowerCase()];

    if (gateway == null) {
      return PaymentResult.failure(
        method: method,
        errorMessage: 'Unsupported payment method',
      );
    }

    return gateway.pay(
      orderId: orderId,
      amount: amount,
      customerPhone: customerPhone,
    );
  }
}
