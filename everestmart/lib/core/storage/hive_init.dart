import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'hive_boxes.dart';

class HiveInit {
  static Future<void> init() async {
    await Hive.initFlutter();

    // Open boxes
    await Future.wait([
      Hive.openBox(HiveBoxes.auth),
      Hive.openBox(HiveBoxes.user),
      Hive.openBox(HiveBoxes.cart),
      Hive.openBox(HiveBoxes.settings),
    ]);

    if (kDebugMode) {
      debugPrint('✅ Hive initialized');
    }
  }
}
