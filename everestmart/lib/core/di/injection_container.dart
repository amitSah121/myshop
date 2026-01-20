// import 'package:everestmart/core/network/hive_token_provider.dart';
// import 'package:everestmart/core/network/token_provider.dart';
// import 'package:everestmart/features/auth/bloc/auth_bloc.dart';
// import 'package:everestmart/features/auth/data/datasources/auth_local_datasource.dart';
// import 'package:everestmart/features/auth/data/datasources/auth_remote_datasource.dart';
// import 'package:everestmart/features/auth/data/repositories/auth_local_implementation.dart';
// import 'package:everestmart/features/auth/data/repositories/auth_remote_impelementation.dart';
// import 'package:everestmart/features/auth/data/repositories/auth_repository_impl.dart';
// import 'package:everestmart/features/auth/domain/repositories/auth_repository.dart';
// import 'package:get_it/get_it.dart';
// import 'package:dio/dio.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';
// import 'package:internet_connection_checker/internet_connection_checker.dart';
// import '../network/network_info.dart';
// import '../network/api_client.dart';
// import '../network/dio_client.dart';
// import '../network/api_endpoints.dart';
// import '../notifications/datasources/fcm_datasource.dart';
// import '../notifications/datasources/notification_remote_datasource.dart';
// import '../notifications/repositories/notification_repository_impl.dart';
// import '../notifications/donain/repositories/notification_repository.dart';


// final sl = GetIt.instance;

// Future<void> initDependencies() async {
//   // ================= EXTERNAL =================
//   sl.registerLazySingleton(() => Dio());
//   sl.registerLazySingleton<InternetConnectionChecker>(
//     () => InternetConnectionChecker.createInstance(),
//   );

//   sl.registerLazySingleton(() => FirebaseMessaging.instance);
//   sl.registerLazySingleton<NetworkInfo>(
//     () => NetworkInfoImpl(sl()),
//   );


//   sl.registerLazySingleton<ApiClient>(
//     () => DioClient(
//       baseUrl: ApiEndpoints.baseUrl,
//     ),
//     // instanceName: 'publicApi',
//   );


//   // ===== Authenticated API =====
//   sl.registerLazySingleton<ApiClient>(
//     () => DioClient(
//       baseUrl: ApiEndpoints.baseUrl,
//       // tokenProvider: sl<TokenProvider>(),
//     ),
//     // instanceName: 'authApi',
//   );

//   sl.registerLazySingleton<NotificationRemoteDataSource>(
//     () => FcmDataSource(sl()),
//   );

//   sl.registerLazySingleton<NotificationRepository>(
//     () => NotificationRepositoryImpl(
//       remote: sl(),
//       api: sl(),
//     ),
//   );

//   sl.registerLazySingleton<TokenProvider>(
//     () => HiveTokenProvider(),
//   );

//   // ========== AUTH ==========
//   sl.registerLazySingleton<AuthRemoteDataSource>(
//     () => AuthRemoteDataSourceImpl(sl<ApiClient>(instanceName: 'publicApi'),),
//   );

//   sl.registerLazySingleton<AuthLocalDataSource>(
//     () => AuthLocalDataSourceImpl(),
//   );

//   sl.registerLazySingleton<AuthRepository>(
//     () => AuthRepositoryImpl(
//       remote: sl(),
//       local: sl(),
//       api: sl<ApiClient>(instanceName: 'authApi'),
//     ),
//   );

//   sl.registerFactory(
//     () => AuthBloc(sl()),
//   );



// }
