class ApiEndpoints {
  // Base
  static const String baseUrl = 'http://100.115.92.204:5000/api';

  // ========== AUTH ==========
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // ========== USERS ==========
  static const String users = '/users';
  static const String deviceToken = '/users/device-token';
  static const String removeDeviceToken = '/users/device-token/remove';

  // ========== CATEGORIES ==========
  static const String categories = '/categories';

  // ========== PRODUCTS ==========
  static const String products = '/products';
  static String productById(String id) => '/products/$id';

  // ========== ORDERS ==========
  static const String orders = '/orders';

  static const String placeOrder = '/orders';

  static String orderById(String id) => '/orders/$id';
  static String payOrder(String id) => '/orders/$id/pay';


  static String cancelOrder(String id) => '/orders/$id/cancel';

  // ========== OTP ==========
  static const String sendOtp = '/otp/send';
  static const String verifyOtp = '/otp/verify';

  // ========== REVIEWS ==========
  static const String reviews = '/reviews';
  // Reviews (Public)
  static String productReviews(String productId) =>
      '/reviews/product/$productId';

  // Reviews (Customer)
  static const String addReview = '/reviews';
  static String markReviewHelpful(String reviewId) =>
      '/reviews/$reviewId/helpful';

  // Reviews (Admin)
  // static const String pendingReviews = '/admin/reviews/pending';
  // static String updateReviewStatus(String reviewId) =>
  //     '/admin/reviews/$reviewId/status';
}
