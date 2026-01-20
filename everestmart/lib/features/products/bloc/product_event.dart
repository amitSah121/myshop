import 'package:equatable/equatable.dart';
import '../domain/entities/product_query.dart';

abstract class ProductEvent extends Equatable {
  const ProductEvent();

  @override
  List<Object?> get props => [];
}

/// Fetch products (list page)
class ProductFetchRequested extends ProductEvent {
  final ProductQuery query;

  const ProductFetchRequested(this.query);

  @override
  List<Object?> get props => [query];
}

/// Fetch single product
class ProductFetchByIdRequested extends ProductEvent {
  final String productId;

  const ProductFetchByIdRequested(this.productId);

  @override
  List<Object?> get props => [productId];
}

