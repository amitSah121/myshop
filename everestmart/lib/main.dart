import 'package:dio/dio.dart';
import 'package:everestmart/core/storage/hive_boxes.dart';
import 'package:everestmart/features/auth/ui/login_page.dart';
import 'package:everestmart/features/auth/ui/profile_page.dart';
import 'package:everestmart/features/auth/ui/register_page.dart';
import 'package:everestmart/features/misc/ui/contact_us_page.dart';
import 'package:everestmart/features/misc/ui/settings_page.dart';
import 'package:everestmart/features/orders/bloc/order_bloc.dart';
import 'package:everestmart/features/orders/data/datasources/order_local_datasource.dart';
import 'package:everestmart/features/orders/data/datasources/order_remote_datasource.dart';
import 'package:everestmart/features/orders/data/repositories/order_repository_impl.dart';
import 'package:everestmart/features/orders/domain/repositories/order_repository.dart';
import 'package:everestmart/features/orders/ui/orders_page.dart';
import 'package:everestmart/features/products/bloc/product_bloc.dart';
import 'package:everestmart/features/products/data/datasources/product_local_datasource.dart';
import 'package:everestmart/features/products/data/datasources/product_remote_datasource.dart';
import 'package:everestmart/features/products/data/repositories/product_repository_impl.dart';
import 'package:everestmart/features/products/domain/repositories/product_repository.dart';
import 'package:everestmart/features/products/ui/product_list_page.dart';
import 'package:everestmart/features/review/data/datasources/review_remote_datasource.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'core/network/api_endpoints.dart';
import 'core/network/dio_client.dart';
import 'core/storage/hive_init.dart';

import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/data/repositories/auth_local_implementation.dart';
import 'features/auth/data/repositories/auth_remote_impelementation.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';

import 'features/categories/bloc/category_bloc.dart';
import 'features/categories/data/datasources/category_local_datasource.dart';
import 'features/categories/data/datasources/category_remote_datasource.dart';
import 'features/categories/data/repositories/category_repository_impl.dart';
import 'features/categories/domain/repositories/category_repository.dart';

import 'features/cart/bloc/cart_bloc.dart';
import 'features/cart/data/data_sources/cart_local_datasource.dart';
import 'features/cart/data/data_sources/cart_remote_datasource.dart';
import 'features/cart/data/repositories/cart_repository_impl.dart';
import 'features/cart/domain/repositories/cart_repository.dart';
import 'features/review/bloc/review_bloc.dart';
import 'features/review/data/repositories/review_repository_impl.dart';
import 'features/review/domain/repositories/review_repository.dart';

import 'mainapp.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await GoogleSignIn.instance.initialize(
    clientId: null,
    serverClientId: 'ANDROID_SERVER_CLIENT_ID',
  );

  await HiveInit.init();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final dioClient = DioClient(baseUrl: ApiEndpoints.baseUrl);
    final dio = Dio();

    return MultiRepositoryProvider(
      providers: [
        /// AUTH
        RepositoryProvider<AuthRepository>(
          create: (_) {
            final remote = AuthRemoteDataSourceImpl(dioClient);
            final local = AuthLocalDataSourceImpl();
            return AuthRepositoryImpl(
              remote: remote,
              local: local,
              api: dioClient,
            );
          },
        ),

        /// CATEGORY
        RepositoryProvider<CategoryRepository>(
          create: (_) {
            final remote = CategoryRemoteDataSourceImpl(dio);
            final local = CategoryLocalDataSourceImpl();
            return CategoryRepositoryImpl(
              remote: remote,
              local: local,
              token: null,
            );
          },
        ),

        /// CART
        RepositoryProvider<CartRepository>(
          create: (_) {
            final remote = CartRemoteDataSourceImpl(dioClient);
            final local = CartLocalDataSourceImpl();
            return CartRepositoryImpl(
              remote: remote,
              local: local,
            );
          },
        ),

        /// ORDER
        RepositoryProvider<OrderRepository>(
          create: (_) {
            final remote = OrderRemoteDataSourceImpl(dioClient);
            final local = OrderLocalDataSourceImpl(HiveBoxes.cartBox);
            return OrderRepositoryImpl(remote: remote, local: local);
          },
        ),

        /// REVIEW
        RepositoryProvider<ReviewRepository>(
          create: (_) {
            final remote = ReviewRemoteDataSourceImpl(dioClient);
            return ReviewRepositoryImpl(remote: remote);
          },
        ),
        /// PRODUCT
        RepositoryProvider<ProductRepository>(
          create: (_) {
            final remote = ProductRemoteDataSourceImpl(dioClient);
            final local = ProductLocalDataSourceImpl();
            return ProductRepositoryImpl(
              remote: remote,
              local: local,
            );
          },
        ),

      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) =>
                AuthBloc(context.read<AuthRepository>()),
          ),
          BlocProvider<CategoryBloc>(
            create: (context) =>
                CategoryBloc(context.read<CategoryRepository>()),
          ),
          BlocProvider<CartBloc>(
            create: (context) =>
                CartBloc(context.read<CartRepository>()),
          ),
          BlocProvider<OrderBloc>(
            create: (context) {

              final remote = OrderRemoteDataSourceImpl(dioClient);
              final local = OrderLocalDataSourceImpl(HiveBoxes.cartBox);
              return OrderBloc(
                OrderRepositoryImpl(
                  remote: remote,
                  local: local,
                ),
              );
            },
          ),
          BlocProvider<ReviewBloc>(
            create: (context) =>
                ReviewBloc(context.read<ReviewRepository>()),
          ),
          BlocProvider<ProductBloc>(
            create: (context) =>
                ProductBloc(context.read<ProductRepository>()),
          ),
        ],
        child: MaterialApp(
          title: 'EverestMart',
          debugShowCheckedModeBanner: false,
          theme: ThemeData.light(),
          darkTheme: ThemeData.dark(),
          themeMode: ThemeMode.light,
          home: MainApp(),
          routes: {
            '/mainapp': (context) => const MainApp(),
            '/login': (context) => const LoginPage(),
            '/register': (context) => const RegisterPage(),
            '/profile': (context) => const ProfilePage(),
            '/products': (context) => const ProductListPage(),
            '/orders': (context) => const OrdersPage(),
            '/contact': (context) => const ContactUsPage(),
            '/settings': (context) => const SettingsPage(),

          },
        ),
      ),
    );
  }
}
