import 'package:everestmart/drawer.dart';
import 'package:everestmart/features/products/bloc/product_bloc.dart';
import 'package:everestmart/features/products/bloc/product_event.dart';
import 'package:everestmart/features/products/bloc/product_state.dart';
import 'package:everestmart/features/products/domain/entities/product_query.dart';
import 'package:everestmart/features/products/ui/product_card.dart';
import 'package:everestmart/features/products/ui/product_filters.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductListPage extends StatefulWidget {
  const ProductListPage({super.key});

  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  final _searchCtrl = TextEditingController();
  bool showFilters = false;

  ProductQuery query = const ProductQuery();

  @override
  void initState() {
    super.initState();
    context.read<ProductBloc>().add(
          ProductFetchRequested(query),
        );
  }

  void _applyFilters(ProductQuery newQuery) {
    setState(() => query = newQuery);
    context.read<ProductBloc>().add(
          ProductFetchRequested(newQuery),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
      ),
      drawer: buildAppDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            // ================= SEARCH =================
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    decoration: const InputDecoration(
                      hintText: 'Search products',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (value) {
                      _applyFilters(
                        query.copyWith(search: value),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.filter_list),
                  onPressed: () {
                    setState(() => showFilters = !showFilters);
                  },
                )
              ],
            ),

            // ================= FILTERS =================
            if (showFilters)
              ProductFilters(
                query: query,
                onApply: _applyFilters,
              ),

            const SizedBox(height: 12),

            // ================= PRODUCT GRID =================
            Expanded(
              child: BlocBuilder<ProductBloc, ProductState>(
                builder: (context, state) {
                  if (state is ProductLoading) {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  }

                  if (state is ProductFailure) {
                    return Center(child: Text(state.message));
                  }

                  if (state is ProductListLoaded) {
                    if (state.products.isEmpty) {
                      return const Center(child: Text('No products found'));
                    }

                    return GridView.builder(
                      itemCount: state.products.length,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 0.72,
                      ),
                      itemBuilder: (context, index) {
                        return ProductCard(
                          product: state.products[index],
                        );
                      },
                    );
                  }

                  return const SizedBox();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}


