import 'package:equatable/equatable.dart';

abstract class ReviewEvent extends Equatable {
  const ReviewEvent();

  @override
  List<Object?> get props => [];
}

// ----------------------------
// Load product reviews
// ----------------------------

class LoadProductReviews extends ReviewEvent {
  final String productId;

  const LoadProductReviews(this.productId);

  @override
  List<Object?> get props => [productId];
}

// ----------------------------
// Add review
// ----------------------------

class AddReviewEvent extends ReviewEvent {
  final String productId;
  final int rating;
  final String title;
  final String comment;
  final List<String>? images;

  const AddReviewEvent({
    required this.productId,
    required this.rating,
    required this.title,
    required this.comment,
    this.images,
  });

  @override
  List<Object?> get props =>
      [productId, rating, title, comment, images];
}

// ----------------------------
// Mark helpful
// ----------------------------

class MarkReviewHelpful extends ReviewEvent {
  final String reviewId;

  const MarkReviewHelpful(this.reviewId);

  @override
  List<Object?> get props => [reviewId];
}
