abstract class OtpRemoteDataSource {
  Future<void> sendOtp(String phone);
  Future<bool> verifyOtp(
    String phone,
    String otp,
  );
}
