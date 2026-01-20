import '../storage/hive_boxes.dart';
import 'token_provider.dart';

class HiveTokenProvider implements TokenProvider {
  @override
  String? get token {
    return HiveBoxes.authBox.get('token');
  }
}
