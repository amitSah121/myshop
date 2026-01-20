import 'package:flutter_bloc/flutter_bloc.dart';
import 'category_event.dart';
import 'category_state.dart';
import '../domain/repositories/category_repository.dart';

class CategoryBloc extends Bloc<CategoryEvent, CategoryState> {
  final CategoryRepository repository;

  CategoryBloc(this.repository) : super(CategoryInitial()) {
    on<CategoryFetchRequested>(_onFetch);
  }

  Future<void> _onFetch(
    CategoryFetchRequested event,
    Emitter<CategoryState> emit,
  ) async {
    emit(CategoryLoading());

    try {
      final categories = await repository.getActiveCategories();
      emit(CategoryLoaded(categories));
    } catch (e) {
      emit(const CategoryFailure('Failed to load categories'));
    }
  }
}
