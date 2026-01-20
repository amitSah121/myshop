class PaymentResult {
  final bool success;
  final String method; // COD, khalti, esewa, card
  final String? transactionId;
  final String? errorMessage;

  const PaymentResult({
    required this.success,
    required this.method,
    this.transactionId,
    this.errorMessage,
  });

  factory PaymentResult.success({
    required String method,
    String? transactionId,
  }) {
    return PaymentResult(
      success: true,
      method: method,
      transactionId: transactionId,
    );
  }

  factory PaymentResult.failure({
    required String method,
    required String errorMessage,
  }) {
    return PaymentResult(
      success: false,
      method: method,
      errorMessage: errorMessage,
    );
  }
}
