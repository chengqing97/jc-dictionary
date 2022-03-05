import 'package:flutter/material.dart';
import 'home_page.dart';
import 'package:get/get.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: '实用小词典',
      theme: ThemeData(
        fontFamily: "Roboto",
        primarySwatch: Colors.grey,
        primaryColor: Colors.white,
        platform: TargetPlatform.iOS,
      ),
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
