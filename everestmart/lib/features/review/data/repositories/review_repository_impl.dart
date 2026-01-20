import '../../domain/entities/review.dart';
import '../../domain/repositories/review_repository.dart';
import '../datasources/review_remote_datasource.dart';
import '../models/review_model.dart';

class ReviewRepositoryImpl implements ReviewRepository {
  final ReviewRemoteDataSource remote;
  final String? token;

  ReviewRepositoryImpl({
    required this.remote,
    this.token,
  });

  @override
  Future<List<Review>> getProductReviews(String productId) async {
    final data = await remote.getProductReviews(productId);
    return data.map(ReviewModel.fromJson).toList();
  }

  @override
  Future<Review> addReview({
    required String productId,
    required int rating,
    required String title,
    required String comment,
    List<String>? images,
  }) async {
    final data = await remote.addReview(token!, {
      'product': productId,
      'rating': rating,
      'title': title,
      'comment': comment,
      'images': images ?? [],
    });

    return ReviewModel.fromJson(data);
  }

  @override
  Future<void> markHelpful(String reviewId) {
    return remote.markHelpful(token!, reviewId);
  }

}
