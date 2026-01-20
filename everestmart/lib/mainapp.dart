import 'package:everestmart/drawer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('EverestMart'), elevation: 0),
      drawer: buildAppDrawer(context),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _heroSection(context),
            const SizedBox(height: 24),
            _categoriesSection(),
            const SizedBox(height: 24),
            _curatedSection(),
            const SizedBox(height: 24),
            _featuresSection(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // ============================
  // HERO SECTION
  // ============================
  Widget _heroSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3D6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          SvgPicture.asset(
            'assets/svg/mountain.svg',
            height: 80,
            colorFilter: const ColorFilter.mode(Colors.black, BlendMode.srcIn),
          ),
          const SizedBox(height: 16),
          const Text(
            'Premium Groceries, Delivered',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Handpicked Quality at your Doorsteps in 10 minutes',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          _searchBar(context),
        ],
      ),
    );
  }

  Widget _searchBar(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/products');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade400),
          borderRadius: BorderRadius.circular(12),
          color: Colors.white,
        ),
        child: Row(
          children: const [
            Expanded(child: Text('Search for products')),
            Icon(Icons.search),
          ],
        ),
      ),
    );
  }

  // ============================
  // CATEGORIES SECTION
  // ============================
  Widget _categoriesSection() {
    final categories = ['groceries', 'gifts', 'fruits', 'vegetables'];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Collections',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            children: categories
                .map(
                  (c) => Chip(
                    label: Text(c),
                    backgroundColor: Colors.grey.shade200,
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }

  // ============================
  // CURATED SELECTIONS (EMULATED)
  // ============================
  Widget _curatedSection() {
    final mockProducts = [
      {
        'name': 'Carrot',
        'price': '₹1000',
        'image': 'https://images.unsplash.com/photo-1582515073490-dc0c4c4bdb1a',
      },
      {
        'name': 'Raddish circles',
        'price': '₹1200',
        'image': 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2',
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Curated Selections',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 260,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: mockProducts.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final p = mockProducts[index];
                return _productCard(p);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _productCard(Map<String, String> p) {
    return Container(
      width: 180,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            child: Image.network(
              p['image']!,
              height: 140,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p['name']!,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(p['price']!),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {},
                    child: const Text('Add'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================
  // BUSINESS FEATURES
  // ============================
  Widget _featuresSection() {
    final features = [
      (
        '01',
        'Express Delivery',
        'Delivered within 15 minutes',
        '02',
        'Premium Quality',
        'Hand picked products',
      ),
      (
        '03',
        'Best Value',
        'Competitive pricing',
        '04',
        'Live Tracking',
        'Track your delivery',
      ),
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3D6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: features
            .map(
              (f) => Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Column(
                      // mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          f.$1,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              f.$2,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(
                              width: 120,
                              child: Text(f.$3, textAlign: TextAlign.center),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Column(
                      // mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          f.$4,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              f.$5,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(
                              width: 120,
                              child: Text(f.$6, textAlign: TextAlign.center),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
            .toList(),
      ),
    );
  }
}
