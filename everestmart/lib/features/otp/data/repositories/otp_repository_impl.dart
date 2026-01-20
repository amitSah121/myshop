import '../../domain/repositories/otp_repository.dart';
import '../datasources/otp_remote_datasource.dart';

class OtpRepositoryImpl implements OtpRepository {
  final OtpRemoteDataSource remote;

  OtpRepositoryImpl(this.remote);

  @override
  Future<void> requestOtp(String phone) {
    return remote.sendOtp(phone);
  }

  @override
  Future<bool> verifyOtp({
    required String phone,
    required String otp,
  }) {
    return remote.verifyOtp(phone, otp);
  }
}
