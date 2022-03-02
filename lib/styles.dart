import 'package:flutter/material.dart';

class Styles {
  static Color get primaryColor => const Color.fromRGBO(212, 246, 213, 1);
  static Color get darkPrimaryColor => const Color.fromRGBO(36, 114, 53, 1);
  static Color get darkGrey => const Color.fromRGBO(61, 61, 61, 1);
  static Color get lightGrey => Colors.grey;

  static TextStyle get appTitle {
    return TextStyle(fontSize: 18, color: darkGrey);
  }

  static TextStyle get searchText => const TextStyle(fontSize: 16);

  static TextStyle get keywordText =>
      const TextStyle(fontSize: 20, fontWeight: FontWeight.w500);

  static TextStyle get loadingText => TextStyle(fontSize: 14, color: lightGrey);

  static TextStyle get phoneticsText =>
      TextStyle(fontSize: 14, color: darkPrimaryColor);

  static TextStyle get resultText =>
      const TextStyle(fontSize: 14, height: 1.4, color: Colors.black);

  static TextStyle get noResultText => TextStyle(
      fontSize: 16,
      height: 1.4,
      color: darkPrimaryColor,
      fontWeight: FontWeight.w500);

  static TextStyle get suggestionText => TextStyle(
      fontSize: 14,
      height: 1.4,
      color: darkPrimaryColor,
      fontWeight: FontWeight.w500);
}
