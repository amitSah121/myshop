import 'package:everestmart/features/products/domain/entities/product_query.dart';
import 'package:flutter/material.dart';

class ProductFilters extends StatefulWidget {
  final ProductQuery query;
  final ValueChanged<ProductQuery> onApply;

  const ProductFilters({
    super.key,
    required this.query,
    required this.onApply,
  });

  @override
  State<ProductFilters> createState() => _ProductFiltersState();
}

class _ProductFiltersState extends State<ProductFilters> {
  late double minPrice;
  late double maxPrice;
  bool inStock = false;

  @override
  void initState() {
    super.initState();
    minPrice = widget.query.minPrice ?? 0;
    maxPrice = widget.query.maxPrice ?? 10000;
    inStock = widget.query.inStock ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(top: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    initialValue: minPrice.toString(),
                    decoration: const InputDecoration(labelText: 'Min price'),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => minPrice = double.tryParse(v) ?? 0,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    initialValue: maxPrice.toString(),
                    decoration: const InputDecoration(labelText: 'Max price'),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => maxPrice = double.tryParse(v) ?? 10000,
                  ),
                ),
              ],
            ),
            CheckboxListTile(
              title: const Text('Show in stock only'),
              value: inStock,
              onChanged: (v) => setState(() => inStock = v!),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () {
                  widget.onApply(
                    widget.query.copyWith(
                      minPrice: minPrice,
                      maxPrice: maxPrice,
                      inStock: inStock,
                    ),
                  );
                },
                child: const Text('Apply'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
