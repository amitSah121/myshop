import 'package:flutter_bloc/flutter_bloc.dart';
import 'product_event.dart';
import 'product_state.dart';
import '../domain/repositories/product_repository.dart';

class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final ProductRepository repository;

  ProductBloc(this.repository) : super(ProductInitial()) {
    on<ProductFetchRequested>(_onFetchProducts);
    on<ProductFetchByIdRequested>(_onFetchById);
  }

  Future<void> _onFetchProducts(
    ProductFetchRequested event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());
    try {
      final products = await repository.getProducts(event.query);
      emit(ProductListLoaded(products));
    } catch (e) {
      emit(ProductFailure(e.toString()));
    }
  }

  Future<void> _onFetchById(
    ProductFetchByIdRequested event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());
    try {
      final product = await repository.getProductById(event.productId);
      emit(ProductLoaded(product));
    } catch (e) {
      emit(ProductFailure(e.toString()));
    }
  }

}
