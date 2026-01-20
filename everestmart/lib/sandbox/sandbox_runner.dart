import 'test_categories.dart';
// import 'test_products.dart';

Future<void> runSandbox() async {
  print('🧪 Sandbox started');

  await testCategories();
  // await testProducts();

  print('✅ Sandbox finished');
}
