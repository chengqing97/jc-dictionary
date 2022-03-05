import 'dart:io';
import 'package:flutter/material.dart';
import 'lib.dart';
import 'package:http/http.dart' as http;
import 'styles.dart';
import 'input_bar.dart';
import 'result_area.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';

enum LookupState { init, searching, success, error }

class Controller extends GetxController {
  final searching = "".obs;
  final errorText = "".obs;
  final lookupState = LookupState.init.obs;
  final lookupResult = Rx<LookupResult?>(null);
  late http.Client client;
  late final AudioPlayer player;
  final inputController = TextEditingController().obs;

  @override
  onInit() {
    super.onInit();
    client = http.Client();
    player = AudioPlayer();
  }

  @override
  void onClose() {
    inputController.value.dispose();
    client.close();
    super.onClose();
  }

  void handleSearch([String? specialSearch]) async {
    var toSearch = specialSearch ?? inputController.value.text;

    if (toSearch.isEmpty) return;

    if (lookupState.value == LookupState.searching) {
      client.close();
      client = http.Client();
    }

    searching.value = toSearch;
    lookupState.value = LookupState.searching;
    lookupResult.value = null;
    errorText.value = "";
    inputController.value.clear();

    try {
      var result = await lookup(toSearch, client);
      lookupResult.value = result;
      lookupState.value = LookupState.success;
      // we clear again because if you search another word too quickly consecutive search might not trigger rerender
      inputController.value.clear();
    } on SocketException {
      // Previous request has been canceled
    } catch (error) {
      if (error.toString() ==
          "Connection closed before full header was received") {
        // Previous request has been canceled
        return;
      }
      errorText.value = error.toString();
      inputController.value.text = searching.value;
      lookupState.value = LookupState.error;
    }
  }
}

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Styles.primaryColor,
        centerTitle: true,
        title: Text("简单粗暴", style: Styles.appTitle),
        shadowColor: Colors.black.withOpacity(0.3),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            ResultArea(),
            InputBar(),
          ],
        ),
      ),
    );
  }
}
