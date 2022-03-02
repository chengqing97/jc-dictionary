import 'package:flutter/material.dart';
import 'lib.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';

const primarySwatch = Colors.pink;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JC Dictionary',
      theme: ThemeData(
        fontFamily: "GenJyuuGothicL",
        primarySwatch: primarySwatch,
      ),
      home: const MainPage(),
    );
  }
}

class Styles {
  static TextStyle get searchText => const TextStyle(fontSize: 14);
  static TextStyle get keywordText => const TextStyle(fontSize: 18, fontWeight: FontWeight.w700);
  static TextStyle get loadingText => const TextStyle(fontSize: 14, color: Colors.grey);
  static TextStyle get phoneticsText =>
      const TextStyle(fontSize: 14, color: primarySwatch, fontFamily: "GenJyuuGothicL");
  static TextStyle get resultText => const TextStyle(fontSize: 14, height: 1.4, color: Colors.black);
  static TextStyle get noResultText =>
      const TextStyle(fontSize: 16, height: 1.4, color: primarySwatch, fontWeight: FontWeight.bold);
  static TextStyle get suggestionText =>
      const TextStyle(fontSize: 14, height: 1.4, color: primarySwatch, fontWeight: FontWeight.bold);
}

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  LookupResult? _lookupResult;
  String _inputText = "";
  String _currentSearch = "";
  String _errorText = "";
  final searchBoxController = TextEditingController();
  late http.Client client;
  late AudioPlayer player;
  List<String> _history = [];

  void _handleSearch([String? specialSearch]) async {
    var toSearch = specialSearch ?? _inputText;
    if (toSearch.isEmpty) return;

    setState(() {
      _currentSearch = toSearch;
      _lookupResult = null;
      _errorText = "";
      _history.add(toSearch);
      searchBoxController.clear();
    });
    try {
      var result = await lookup(toSearch, client);
      searchBoxController.clear();
      setState(() {
        _lookupResult = result;
        _inputText = "";
      });
    } catch (error) {
      setState(() {
        _errorText = error.toString();
        searchBoxController.text = _currentSearch;
      });
    } finally {
      _currentSearch = "";
    }
  }

  @override
  void initState() {
    super.initState();
    client = http.Client();
    player = AudioPlayer();
  }

  @override
  void dispose() {
    searchBoxController.dispose();
    client.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: const Text("简词"),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.elliptical(240, 5),
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Results
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // SizedBox(height: 30),
                      if (_currentSearch.isNotEmpty)
                        Text("Looking up $_currentSearch...", style: Styles.loadingText)
                      else if (_errorText.isNotEmpty)
                        Text(_errorText, style: Styles.resultText)
                      else if (_lookupResult != null) ...[
                        if (_lookupResult!.definition == null && _lookupResult!.suggestions == null)
                          Text("No result", style: Styles.noResultText),
                        if (_lookupResult!.definition != null) ...[
                          Text(_lookupResult!.keyword, style: Styles.keywordText),
                          const SizedBox(height: 20),
                          () {
                            String text = "";
                            if (_lookupResult!.ukPronunciation != null) {
                              text += "英 ${_lookupResult!.ukPronunciation}  ";
                            }
                            if (_lookupResult!.usPronunciation != null) {
                              text += "美 ${_lookupResult!.usPronunciation}";
                            }
                            if (text.isEmpty) return Container();
                            return Text(text, style: Styles.phoneticsText);
                          }(),
                          const SizedBox(height: 2),
                          Text(_lookupResult!.definition!, style: Styles.resultText)
                        ],
                        if (_lookupResult?.suggestions != null) ...[
                          if (_lookupResult!.definition != null) const SizedBox(height: 60),
                          Text("Are you looking for:", style: Styles.resultText),
                          for (var item in _lookupResult!.suggestions!)
                            GestureDetector(
                              onTap: () => _handleSearch(item.word),
                              child: RichText(
                                text: TextSpan(style: Styles.resultText.copyWith(height: 1.6), children: [
                                  TextSpan(text: "${item.word}  ", style: Styles.suggestionText),
                                  TextSpan(text: item.def ?? ""),
                                ]),
                              ),
                            ),
                        ],
                      ] else
                        Center(
                            child: Column(
                          children: [Text("你好！")],
                        )),
                    ],
                  ),
                ),
              ),
            ),
            // Search Box
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black87,
                            blurRadius: 1,
                            blurStyle: BlurStyle.outer,
                            offset: Offset.zero,
                            spreadRadius: 0,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              onChanged: (text) => setState(() => _inputText = text),
                              controller: searchBoxController,
                              onEditingComplete: _handleSearch,
                              autofocus: true,
                              style: Styles.searchText,
                              cursorColor: Colors.black,
                              cursorWidth: 1,
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.fromLTRB(14, 5, 5, 5),
                                filled: false,
                              ),
                            ),
                          ),
                          if (_inputText.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                searchBoxController.clear();
                                setState(() {
                                  _inputText = "";
                                });
                              },
                              child: Container(
                                height: 30,
                                width: 30,
                                margin: const EdgeInsets.only(right: 3),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                child: const Center(
                                  child: Icon(Icons.close_rounded, size: 16),
                                ),
                              ),
                            )
                          else if (_lookupResult != null && _inputText != _lookupResult!.keyword)
                            GestureDetector(
                              onTap: () {
                                searchBoxController.text = _lookupResult!.keyword;
                                searchBoxController.selection =
                                    TextSelection.fromPosition(TextPosition(offset: _lookupResult!.keyword.length));
                                setState(() {
                                  _inputText = _lookupResult!.keyword;
                                });
                              },
                              child: Container(
                                height: 30,
                                margin: const EdgeInsets.only(right: 16),
                                child: const Center(
                                  child: Text("Previous", style: TextStyle(color: Colors.grey, fontSize: 12)),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  // Voice Buttons
                  if (_lookupResult?.ukVoice != null)
                    GestureDetector(
                      onTap: () async {
                        await player.setUrl(_lookupResult!.ukVoice!);
                        player.play();
                      },
                      child: Container(
                        height: 30,
                        width: 30,
                        margin: const EdgeInsets.only(left: 12),
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(15), color: Theme.of(context).primaryColor),
                        child: const Center(
                          child: Text(
                            "英",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                  if (_lookupResult?.usVoice != null)
                    GestureDetector(
                      onTap: () async {
                        await player.setUrl(_lookupResult!.usVoice!);
                        player.play();
                      },
                      child: Container(
                        height: 30,
                        width: 30,
                        margin: const EdgeInsets.only(left: 10),
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(15), color: Theme.of(context).primaryColor),
                        child: const Center(
                          child: Text(
                            "美",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
