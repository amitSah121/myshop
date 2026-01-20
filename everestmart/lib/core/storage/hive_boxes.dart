import 'package:hive_flutter/hive_flutter.dart';

class HiveBoxes {
  static const String auth = 'auth_box';
  static const String user = 'user_box';
  static const String cart = 'cart_box';
  static const String settings = 'settings_box';

  // Box getters (typed if possible)
  static Box get authBox => Hive.box(auth);
  static Box get userBox => Hive.box(user);
  static Box get cartBox => Hive.box(cart);
  static Box get settingsBox => Hive.box(settings);
}
