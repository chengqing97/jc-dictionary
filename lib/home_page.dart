import 'dart:io';
import 'package:flutter/material.dart';
import 'lib.dart';
import 'package:http/http.dart' as http;
import 'styles.dart';
import 'input_bar.dart';
import 'result_area.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';
import 'package:flutter/services.dart';
import 'dart:async';

enum LookupState { init, searching, success, error }
enum Accent { uk, us }

class Controller extends FullLifeCycleController {
  final searching = "".obs;
  final errorText = "".obs;
  final lookupState = LookupState.init.obs;
  final lookupResult = Rx<LookupResult?>(null);
  late http.Client client;
  late final AudioPlayer player;
  final inputController = TextEditingController().obs;
  final inputText = "".obs;

  @override
  onInit() {
    super.onInit();
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light
        .copyWith(systemNavigationBarColor: Colors.white));
    WidgetsBinding.instance!.addObserver(this);
    client = http.Client();
    player = AudioPlayer();
    inputController.value.addListener(() {
      inputText.value = inputController.value.text;
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    Timer? timer;
    if (state == AppLifecycleState.inactive) {
      timer = Timer(const Duration(minutes: 5), () {
        searching.value = "";
        lookupResult.value = null;
        lookupState.value = LookupState.init;
      });
    }
    if (state == AppLifecycleState.resumed) {
      timer?.cancel();
    }
  }

  @override
  void onClose() {
    inputController.value.dispose();
    client.close();
    WidgetsBinding.instance!.addObserver(this);
    super.onClose();
  }

  void handleSearch([String? specialSearch]) async {
    var toSearch = specialSearch ?? inputText.value;

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
      // we clear again because if you search another word too quickly consecutive search might not trigger rerender as a result the second searched word is still on the screen
      // the condition is to avoid clearing the word that user type whilst the app is searching the previous word
      if (inputController.value.text.isEmpty) inputController.value.clear();
    } on SocketException {
      // Previous request has been canceled
    } catch (error) {
      if (error.toString() ==
          "Connection closed before full header was received") {
        // Previous request has been canceled
        return;
      }
      errorText.value = error.toString();
      if (inputController.value.text.isEmpty) {
        inputController.value.text = searching.value;
      }
      lookupState.value = LookupState.error;
    }
  }

  void playVoice(Accent accent) async {
    if (lookupResult.value == null) return;
    if (accent == Accent.uk && lookupResult.value!.ukVoice != null) {
      await player.setUrl(lookupResult.value!.ukVoice!);
      player.play();
    }
    if (accent == Accent.us && lookupResult.value!.usVoice != null) {
      await player.setUrl(lookupResult.value!.usVoice!);
      player.play();
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
