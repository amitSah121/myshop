abstract class OtpRepository {
  Future<void> requestOtp(String phone);
  Future<bool> verifyOtp({
    required String phone,
    required String otp,
  });
}
