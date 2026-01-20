import 'package:everestmart/features/products/bloc/product_bloc.dart';
import 'package:everestmart/features/products/bloc/product_event.dart';
import 'package:everestmart/features/products/bloc/product_state.dart';
import 'package:everestmart/features/products/ui/quality_selector.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductDetailPage extends StatefulWidget {
  final String productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  int quantity = 1;

  @override
  void initState() {
    super.initState();
    context
        .read<ProductBloc>()
        .add(ProductFetchByIdRequested(widget.productId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: BlocBuilder<ProductBloc, ProductState>(
        builder: (context, state) {
          if (state is ProductLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ProductFailure) {
            return Center(child: Text(state.message));
          }

          if (state is ProductLoaded) {
            final p = state.product;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.network(p.image, height: 250, fit: BoxFit.cover),
                  const SizedBox(height: 12),
                  Text(p.name,
                      style: Theme.of(context).textTheme.headlineSmall),
                  Text('₹${p.price}'),
                  const SizedBox(height: 8),
                  Text(p.description),
                  const SizedBox(height: 12),
                  QuantitySelector(
                    value: quantity,
                    onChanged: (v) => setState(() => quantity = v),
                  ),
                  const SizedBox(height: 12),
                  Text('Delivery charge: ₹100'),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {},
                      child: const Text('Add'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Recommendations',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            );
          }

          return const SizedBox();
        },
      ),
    );
  }
}
