class Review {
  final String id;
  final String productId;
  final String userId;

  final int rating;
  final String title;
  final String comment;
  final List<String> images;

  final bool verified;
  final int helpfulCount;
  final String status; // pending | approved | rejected
  final DateTime createdAt;

  const Review({
    required this.id,
    required this.productId,
    required this.userId,
    required this.rating,
    required this.title,
    required this.comment,
    required this.images,
    required this.verified,
    required this.helpfulCount,
    required this.status,
    required this.createdAt,
  });
}
