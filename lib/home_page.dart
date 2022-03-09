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
enum Accent { uk, us }

class Controller extends GetxController {
  final searching = "".obs;
  final errorText = "".obs;
  final lookupState = LookupState.init.obs;
  final lookupResult = Rx<LookupResult?>(null);
  final voiceUrl = VoiceUrl().obs;
  final inputText = "".obs;
  final isGettingVoiceUrl = false.obs;

  late TextEditingController inputController;
  late http.Client youdaoClient;
  late http.Client voiceClient;
  late AudioPlayer ukPlayer;
  late AudioPlayer usPlayer;
  Future? ukPlayerFuture;
  Future? usPlayerFuture;
  bool ukPlayerIsLoaded = false;
  bool usPlayerIsLoaded = false;

  @override
  onInit() {
    super.onInit();
    youdaoClient = http.Client();
    voiceClient = http.Client();
    ukPlayer = AudioPlayer();
    usPlayer = AudioPlayer();
    inputController = TextEditingController();
    inputController.addListener(() {
      inputText.value = inputController.text;
    });
  }

  @override
  void onClose() {
    inputController.dispose();
    youdaoClient.close();
    voiceClient.close();
    ukPlayer.dispose();
    usPlayer.dispose();
    super.onClose();
  }

  void handleSearch([String? specialSearch]) async {
    var toSearch = specialSearch ?? inputText.value;

    if (toSearch.isEmpty) return;

    if (lookupState.value == LookupState.searching) {
      youdaoClient.close();
      youdaoClient = http.Client();
    }
    if (isGettingVoiceUrl.value) {
      voiceClient.close();
      voiceClient = http.Client();
    }

    inputController.clear();
    searching.value = toSearch;
    lookupState.value = LookupState.searching;
    lookupResult.value = null;
    voiceUrl.value = VoiceUrl();
    errorText.value = "";

    try {
      await getVoice(toSearch);
      final result = await lookup(toSearch, youdaoClient);
      lookupResult.value = result;
      lookupState.value = LookupState.success;
    } on SocketException {
      // Previous request has been canceled
    } catch (error) {
      if (error.toString() ==
          "Connection closed before full header was received") {
        // Previous request has been canceled
        return;
      }
      errorText.value = error.toString();
      if (inputController.text.isEmpty) {
        inputController.text = searching.value;
        inputController.selection = TextSelection.fromPosition(
            TextPosition(offset: searching.value.length));
      }
      lookupState.value = LookupState.error;
    }
  }

  Future getVoice(String toSearch) async {
    try {
      isGettingVoiceUrl.value = true;
      final VoiceUrl urls = await getVoiceUrl(toSearch, youdaoClient);

      voiceUrl.value = urls;
      if (urls.uk != null) {
        ukPlayerIsLoaded = false;
        ukPlayerFuture = ukPlayer.setUrl(urls.uk!, preload: true);
      }
      if (urls.us != null) {
        usPlayerIsLoaded = false;
        usPlayerFuture = usPlayer.setUrl(urls.us!);
      }
    } finally {
      isGettingVoiceUrl.value = false;
    }
  }

  Future playVoice(Accent accent) async {
    if (lookupResult.value == null) return;
    if (accent == Accent.uk && voiceUrl.value.uk != null) {
      if (!ukPlayerIsLoaded) {
        await ukPlayerFuture;
        ukPlayerIsLoaded = true;
      }
      await ukPlayer.seek(Duration.zero);
      await ukPlayer.play();
      ukPlayer.stop();
    }
    if (accent == Accent.us && voiceUrl.value.us != null) {
      if (!usPlayerIsLoaded) {
        await usPlayerFuture;
        usPlayerIsLoaded = true;
      }
      await usPlayer.seek(Duration.zero);
      await usPlayer.play();
      usPlayer.stop();
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
