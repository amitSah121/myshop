class OrderPaymentRequest {
  final String orderId;
  final double amount;
  final String paymentMethod; // cod | khalti | esewa | card
  final String customerPhone;

  const OrderPaymentRequest({
    required this.orderId,
    required this.amount,
    required this.paymentMethod,
    required this.customerPhone,
  });
}
