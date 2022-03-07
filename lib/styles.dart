import 'package:flutter/material.dart';

class Styles {
  static double get padding => 12;

  static Color get primaryColor => const Color.fromRGBO(212, 246, 213, 1);
  static Color get darkPrimaryColor => const Color.fromRGBO(36, 114, 53, 1);
  static Color get darkGrey => const Color.fromRGBO(61, 61, 61, 1);
  static Color get lightGrey => Colors.grey;

  static TextStyle get appTitle {
    return TextStyle(fontSize: 18, color: darkGrey);
  }

  static TextStyle get inputText => const TextStyle(fontSize: 16, height: 1);

  static TextStyle get historyTagText =>
      const TextStyle(fontSize: 14, height: 1);

  static TextStyle get loadingText => TextStyle(fontSize: 16, color: lightGrey);

  static TextStyle get welcomeText => const TextStyle(fontSize: 18);

  static TextStyle get title =>
      const TextStyle(fontSize: 24, fontWeight: FontWeight.w500);

  static TextStyle get phoneticsText =>
      TextStyle(fontSize: 16, color: darkPrimaryColor);

  static TextStyle get phoneticsTextDisabled =>
      phoneticsText.copyWith(color: lightGrey, fontWeight: FontWeight.w500);

  static TextStyle get resultText =>
      const TextStyle(fontSize: 16, height: 1.4, color: Colors.black);

  static TextStyle get noResultText => TextStyle(
      fontSize: 18,
      height: 1.4,
      color: darkPrimaryColor,
      fontWeight: FontWeight.w500);

  static TextStyle get suggestionText => TextStyle(
      fontSize: 16,
      height: 2.0,
      color: darkPrimaryColor,
      fontWeight: FontWeight.w500);

  static TextStyle get suggestionDefinition =>
      const TextStyle(fontSize: 16, height: 1.1, color: Colors.black);

  static TextStyle get voiceButtonText =>
      TextStyle(fontSize: 16, color: darkGrey, height: 1);
}
