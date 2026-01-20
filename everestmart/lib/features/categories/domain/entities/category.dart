class Category {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String icon;
  final bool isActive;
  final DateTime createdAt;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.icon,
    required this.isActive,
    required this.createdAt,
  });
}
