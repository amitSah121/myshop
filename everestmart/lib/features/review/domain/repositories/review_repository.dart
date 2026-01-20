import '../entities/review.dart';

abstract class ReviewRepository {
  // Public
  Future<List<Review>> getProductReviews(String productId);

  // Customer
  Future<Review> addReview({
    required String productId,
    required int rating,
    required String title,
    required String comment,
    List<String>? images,
  });

  Future<void> markHelpful(String reviewId);

}
