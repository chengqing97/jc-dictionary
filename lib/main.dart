import 'package:flutter/material.dart';
import 'home_page.dart';
import 'package:get/get.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const MyApp());
}

class SystemController extends GetxController {
  @override
  onInit() {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light
        .copyWith(systemNavigationBarColor: Colors.white));
    super.onInit();
  }
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(SystemController());
    return GetMaterialApp(
      title: '实用小词典',
      theme: ThemeData(
        fontFamily: "Roboto",
        primarySwatch: Colors.blue,
        primaryColor: Colors.white,
        platform: TargetPlatform.iOS,
      ),
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
