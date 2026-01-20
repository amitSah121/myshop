import 'package:dio/dio.dart';

Future<void> main() async {
  print('📦 Testing pure Dio GET /categories');

  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:5000/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Accept': 'application/json',
      },
    ),
  );

  try {
    final response = await dio.post('/auth/register',data: {"name":"amit","email":"e@gmail.com","password":"password"});

    print('✅ Status code: ${response.statusCode}');
    print('📦 Response data:');
    print(response.data);
  } on DioException catch (e) {
    print('❌ Dio error');
    print('Type: ${e.type}');
    print('Message: ${e.message}');
    print('Response: ${e.response?.data}');
  } catch (e) {
    print('❌ Unknown error: $e');
  }
}
