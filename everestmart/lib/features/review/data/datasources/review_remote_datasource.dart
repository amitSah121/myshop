import 'package:everestmart/core/network/api_client.dart';
import 'package:everestmart/core/network/api_endpoints.dart';

abstract class ReviewRemoteDataSource {
  // Public
  Future<List<Map<String, dynamic>>> getProductReviews(
    String productId,
  );

  // Customer
  Future<Map<String, dynamic>> addReview(
    String token,
    Map<String, dynamic> body,
  );

  Future<void> markHelpful(
    String token,
    String reviewId,
  );

  // Admin
}


class ReviewRemoteDataSourceImpl implements ReviewRemoteDataSource {
  final ApiClient api;

  ReviewRemoteDataSourceImpl(this.api);

  // ============================
  // Public
  // ============================

  @override
  Future<List<Map<String, dynamic>>> getProductReviews(
    String productId,
  ) async {
    final response = await api.get(
      ApiEndpoints.productReviews(productId),
    );

    return List<Map<String, dynamic>>.from(response);
  }

  // ============================
  // Customer
  // ============================

  @override
  Future<Map<String, dynamic>> addReview(
    String token,
    Map<String, dynamic> body,
  ) async {
    final response = await api.post(
      ApiEndpoints.addReview,
      body,
    );

    return response as Map<String, dynamic>;
  }

  @override
  Future<void> markHelpful(
    String token,
    String reviewId,
  ) async {
    await api.post(
      ApiEndpoints.markReviewHelpful(reviewId),
      {},
    );
  }

}
