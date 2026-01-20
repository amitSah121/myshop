import 'package:flutter/material.dart';

class AppColors {
  // 🔶 Primary (main brand)
  static const Color primary = Color(0xFFFFA000);       // amber/orange
  static const Color primaryLight = Color(0xFFFFD54F);
  static const Color primaryDark = Color(0xFFFF6F00);

  // 🟢 Secondary (accent)
  static const Color secondary = Color(0xFF00796B);     // teal
  static const Color secondaryLight = Color(0xFF4DB6AC);
  static const Color secondaryDark = Color(0xFF004D40);

  // 🧱 Neutrals
  static const Color background = Color(0xFF121212);    // dark background
  static const Color surface = Color(0xFF1E1E1E);       // cards / sheets
  static const Color error = Color(0xFFD32F2F);

  // 🖊 On-colors (content on top)
  static const Color onPrimary = Colors.black;
  static const Color onSecondary = Colors.white;
  static const Color onBackground = Colors.white;
  static const Color onSurface = Colors.white;
  static const Color onError = Colors.white;
}
