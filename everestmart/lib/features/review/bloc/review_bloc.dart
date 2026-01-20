import 'package:everestmart/features/review/domain/repositories/review_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'review_event.dart';
import 'review_state.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  final ReviewRepository repository;

  ReviewBloc(this.repository) : super(ReviewInitial()) {
    on<LoadProductReviews>(_loadReviews);
    on<AddReviewEvent>(_addReview);
    on<MarkReviewHelpful>(_markHelpful);
  }

  // ----------------------------

  Future<void> _loadReviews(
    LoadProductReviews event,
    Emitter<ReviewState> emit,
  ) async {
    emit(ReviewLoading());
    try {
      final reviews =
          await repository.getProductReviews(event.productId);
      emit(ReviewLoaded(reviews));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _addReview(
    AddReviewEvent event,
    Emitter<ReviewState> emit,
  ) async {
    try {
      await repository.addReview(
        productId: event.productId,
        rating: event.rating,
        title: event.title,
        comment: event.comment,
        images: event.images,
      );

      // reload reviews after adding
      final reviews =
          await repository.getProductReviews(event.productId);
      emit(ReviewLoaded(reviews));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }

  // ----------------------------

  Future<void> _markHelpful(
    MarkReviewHelpful event,
    Emitter<ReviewState> emit,
  ) async {
    if (state is! ReviewLoaded) return;

    try {
      await repository.markHelpful(event.reviewId);
      // UI can optimistically update, or reload if you want
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }
}
