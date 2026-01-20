import '../../domain/entities/review.dart';

class ReviewModel extends Review {
  const ReviewModel({
    required super.id,
    required super.productId,
    required super.userId,
    required super.rating,
    required super.title,
    required super.comment,
    required super.images,
    required super.verified,
    required super.helpfulCount,
    required super.status,
    required super.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['_id'],
      productId: json['product'],
      userId: json['user'],
      rating: json['rating'],
      title: json['title'],
      comment: json['comment'],
      images: List<String>.from(json['images'] ?? []),
      verified: json['verified'] ?? false,
      helpfulCount: json['helpful']?['count'] ?? 0,
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
