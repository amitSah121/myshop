import '../../domain/entities/user.dart';
import '../../domain/entities/address.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/user_remote_datasource.dart';
import '../datasources/user_local_datasource.dart';
import '../models/user_model.dart';
import '../models/address_model.dart';

class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remote;
  final UserLocalDataSource local;
  final String token;

  UserRepositoryImpl({
    required this.remote,
    required this.local,
    required this.token,
  });

  @override
  Future<User> getProfile() async {
    final data = await remote.getProfile(token);
    await local.cacheUser(data);
    return UserModel.fromJson(data);
  }

  @override
  Future<User> updateProfile({
    required String name,
    String? phone,
  }) async {
    final data = await remote.updateProfile(token, {
      'name': name,
      'phone': phone,
    });
    return UserModel.fromJson(data);
  }

  @override
  Future<List<Address>> getAddresses() async {
    final user = await getProfile();
    return user.addresses;
  }

  @override
  Future<Address> addAddress(Address address) async {
    final data = await remote.addAddress(token, {
      'label': address.label,
      'fullName': address.fullName,
      'phone': address.phone,
      'addressLine1': address.addressLine1,
      'addressLine2': address.addressLine2,
      'landmark': address.landmark,
      'city': address.city,
      'state': address.state,
      'pincode': address.pincode,
    });

    return AddressModel.fromJson(data);
  }

  @override
  Future<void> deleteAddress(String addressId) {
    return remote.deleteAddress(token, addressId);
  }

  @override
  Future<Address> setDefaultAddress(String addressId) async {
    final data = await remote.setDefaultAddress(token, addressId);
    return AddressModel.fromJson(data);
  }

  @override
  Future<User> addToCart(String productId, int quantity) async {
    final data =
        await remote.addToCart(token, productId, quantity);
    return UserModel.fromJson(data);
  }

  @override
  Future<User> removeFromCart(String productId) async {
    final data =
        await remote.removeFromCart(token, productId);
    return UserModel.fromJson(data);
  }

  @override
  Future<User> addToWishlist(String productId) async {
    final data =
        await remote.addToWishlist(token, productId);
    return UserModel.fromJson(data);
  }

  @override
  Future<User> removeFromWishlist(String productId) async {
    final data =
        await remote.removeFromWishlist(token, productId);
    return UserModel.fromJson(data);
  }
}
