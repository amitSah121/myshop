import '../../domain/entities/address.dart';

class AddressModel extends Address {
  const AddressModel({
    required super.id,
    required super.label,
    required super.fullName,
    required super.phone,
    required super.addressLine1,
    super.addressLine2,
    super.landmark,
    required super.city,
    required super.state,
    required super.pincode,
    required super.isDefault,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['_id'],
      label: json['label'],
      fullName: json['fullName'],
      phone: json['phone'],
      addressLine1: json['addressLine1'],
      addressLine2: json['addressLine2'],
      landmark: json['landmark'],
      city: json['city'],
      state: json['state'],
      pincode: json['pincode'],
      isDefault: json['isDefault'] ?? false,
    );
  }
}
