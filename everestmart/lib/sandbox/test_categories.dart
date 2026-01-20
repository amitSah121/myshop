// import 'package:everestmart/core/di/injection_container.dart';

import '../core/network/dio_client.dart';

Future<void> testCategories() async {
  print('📦 Testing GET /categories');

  final api = DioClient(
    baseUrl: 'http://localhost:5000/api',
  );


  try {
    final response = await api.get('/categories');
    print('✅ Categories response:');
    print(response);
  } catch (e) {
    print('❌ Categories error: $e');
  }
}


// import 'dart:convert';
// import 'package:http/http.dart' as http;

// Future<void> testCategories() async {
//   print('📦 Testing GET /categories');

//   final uri = Uri.parse(
//     'http://localhost:5000/api/categories',
//   );

//   try {
//     final response = await http.get(
//       uri,
//       headers: {
//         'Accept': 'application/json',
//       },
//     );

//     print('🔢 Status code: ${response.statusCode}');
//     print('📦 Raw body: ${response.body}');

//     if (response.statusCode == 200) {
//       final data = jsonDecode(response.body);
//       print('✅ Parsed response: $data');
//     } else {
//       print('❌ Server returned error');
//     }
//   } catch (e, stack) {
//     print('❌ HTTP error: $e');
//     print(stack);
//   }
// }
