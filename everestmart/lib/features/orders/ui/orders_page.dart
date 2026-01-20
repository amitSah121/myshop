import 'package:everestmart/drawer.dart';
import 'package:everestmart/features/auth/data/datasources/auth_local_datasource.dart';
import 'package:everestmart/features/orders/domain/entities/order.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';

class OrdersPage extends StatefulWidget {
  // final String token;

  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  late String token; // load the token now

  @override
  void initState() {
    super.initState();
    // _loadToken
    loadToken();

    context.read<OrderBloc>().add(FetchMyOrdersEvent(""));
  }

  void loadToken() async{
    final blocOrder = context.read<OrderBloc>();
    token = (await context.read<AuthLocalDataSource>().getToken()) ?? "";
    blocOrder.add(FetchMyOrdersEvent(token));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Orders'),
      ),
      drawer: buildAppDrawer(context),
      body: BlocBuilder<OrderBloc, OrderState>(
        builder: (context, state) {
          if (state is OrderLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is OrderError) {
            return Center(child: Text(state.message));
          }

          if (state is OrdersLoaded) {
            if (state.orders.isEmpty) {
              return const Center(child: Text('No orders yet'));
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                return _OrderCard(
                  order: state.orders[index],
                  token: token,
                );
              },
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}


class _OrderCard extends StatelessWidget {
  final Order order;
  final String token;

  const _OrderCard({
    required this.order,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Header
            Text(
              'Order #${order.id}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              order.createdAt.toString(),
              style: const TextStyle(color: Colors.grey),
            ),

            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.grey.shade100,
              child: Column(
                children: order.items.map((item) {
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${item.quantity}. ${item.name}'),
                      Text('₹ ${item.price}'),
                    ],
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 12),

            _priceRow('Subtotal', order.totalAmount - order.deliveryCharges),
            _priceRow('Delivery', order.deliveryCharges),

            const Divider(),

            _priceRow(
              'Total',
              order.totalAmount,
              bold: true,
            ),

            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                    ),
                    onPressed: () {
                      _showOtp(context, "otp");//order.otp); # otp api not defined in server
                    },
                    child: const Text('Delivery OTP'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                    onPressed: () {
                      context.read<OrderBloc>().add(
                            CancelOrderEvent(
                              orderId: order.id,
                              reason: 'User cancelled',
                              token: token,
                            ),
                          );
                    },
                    child: const Text('Cancel Order'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceRow(String label, num value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            '₹ $value',
            style: bold
                ? const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
                : null,
          ),
        ],
      ),
    );
  }

  void _showOtp(BuildContext context, String otp) {
    showDialog(
      context: context,
      builder: (_) {
        return Dialog(
          backgroundColor: Colors.amber.shade100,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'OTP',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  otp,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
