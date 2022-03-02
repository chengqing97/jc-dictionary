import 'package:flutter/material.dart';
import 'lib.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'styles.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '实用小词典',
      theme: ThemeData(
        fontFamily: "Roboto",
        primarySwatch: Colors.grey,
        primaryColor: Colors.white,
      ),
      home: const MainPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> with WidgetsBindingObserver {
  LookupResult? _lookupResult;
  String _inputText = "";
  String _currentSearch = "";
  String _errorText = "";
  bool _isBeforeStartTyping = true;
  final searchBoxController = TextEditingController();
  late http.Client client;
  late AudioPlayer player;
  final List<String> _history = [];

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
        backgroundColor: Styles.primaryColor,
        centerTitle: true,
        title: Text("简单粗暴", style: Styles.appTitle),
        shadowColor: Colors.black.withOpacity(0.3),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Results
            Expanded(
              child: ShaderMask(
                shaderCallback: (Rect rect) {
                  return LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.white.withOpacity(0), Colors.white],
                    stops: const [0.95, 1.0],
                  ).createShader(rect);
                },
                blendMode: BlendMode.dstOut,
                child: CustomScrollView(
                  physics: const BouncingScrollPhysics(
                      parent: AlwaysScrollableScrollPhysics()),
                  slivers: [
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 30),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (_currentSearch.isNotEmpty)
                              Text("Looking up $_currentSearch...",
                                  style: Styles.loadingText)
                            else if (_errorText.isNotEmpty)
                              Text(_errorText, style: Styles.resultText)
                            else if (_lookupResult != null) ...[
                              if (_lookupResult!.definition == null &&
                                  _lookupResult!.suggestions == null)
                                Text("No result", style: Styles.noResultText),
                              if (_lookupResult!.definition != null) ...[
                                Text(_lookupResult!.keyword,
                                    style: Styles.keywordText),
                                const SizedBox(height: 20),
                                () {
                                  String text = "";
                                  if (_lookupResult!.ukPronunciation != null) {
                                    text +=
                                        "英 ${_lookupResult!.ukPronunciation}  ";
                                  }
                                  if (_lookupResult!.usPronunciation != null) {
                                    text +=
                                        "美 ${_lookupResult!.usPronunciation}";
                                  }
                                  if (text.isEmpty) return Container();
                                  return Text(text,
                                      style: Styles.phoneticsText);
                                }(),
                                const SizedBox(height: 2),
                                Text(_lookupResult!.definition!,
                                    style: Styles.resultText)
                              ],
                              if (_lookupResult?.suggestions != null) ...[
                                if (_lookupResult!.definition != null)
                                  const SizedBox(height: 60),
                                Text("Are you looking for:",
                                    style: Styles.resultText),
                                for (var item in _lookupResult!.suggestions!)
                                  GestureDetector(
                                    onTap: () => _handleSearch(item.word),
                                    child: RichText(
                                      text: TextSpan(
                                          style: Styles.resultText
                                              .copyWith(height: 1.6),
                                          children: [
                                            TextSpan(
                                                text: "${item.word}  ",
                                                style: Styles.suggestionText),
                                            TextSpan(text: item.def ?? ""),
                                          ]),
                                    ),
                                  ),
                              ],
                            ] else
                              const Expanded(
                                child: Center(
                                    child: Text("你好！",
                                        style: TextStyle(fontSize: 16))),
                              ),
                          ],
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
            // Search Box
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 5, 12, 10),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 34,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          border:
                              Border.all(color: Styles.lightGrey, width: 1)),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              onChanged: (text) => setState(() {
                                _inputText = text;
                                _isBeforeStartTyping = false;
                              }),
                              controller: searchBoxController,
                              onEditingComplete: _handleSearch,
                              autofocus: true,
                              style: Styles.searchText,
                              cursorColor: Colors.black,
                              cursorWidth: 1,
                              textInputAction: TextInputAction.search,
                              decoration: InputDecoration(
                                hintText: _isBeforeStartTyping
                                    ? "Start typing..."
                                    : "",
                                hintStyle: Styles.loadingText,
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding:
                                    const EdgeInsets.fromLTRB(14, 5, 5, 5),
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
                                height: 34,
                                width: 34,
                                margin: const EdgeInsets.only(right: 3),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(17),
                                ),
                                child: const Center(
                                  child: Icon(Icons.close_rounded, size: 16),
                                ),
                              ),
                            )
                          else if (_lookupResult != null &&
                              _inputText != _lookupResult!.keyword)
                            GestureDetector(
                              onTap: () {
                                searchBoxController.text =
                                    _lookupResult!.keyword;
                                searchBoxController.selection =
                                    TextSelection.fromPosition(TextPosition(
                                        offset: _lookupResult!.keyword.length));
                                setState(() {
                                  _inputText = _lookupResult!.keyword;
                                });
                              },
                              child: Container(
                                height: 34,
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: Center(
                                  child: Text("Previous",
                                      style: TextStyle(
                                          color: Styles.darkGrey,
                                          fontSize: 12)),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  // Voice Buttons
                  if (_lookupResult?.ukVoice != null)
                    VoiceButton(
                      onTap: () async {
                        await player.setUrl(_lookupResult!.ukVoice!);
                        player.play();
                      },
                      text: "英",
                    ),
                  if (_lookupResult?.usVoice != null)
                    VoiceButton(
                      onTap: () async {
                        await player.setUrl(_lookupResult!.usVoice!);
                        player.play();
                      },
                      text: "美",
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

// Voice Button
class VoiceButton extends StatelessWidget {
  const VoiceButton({Key? key, required this.onTap, required this.text})
      : super(key: key);

  final Function() onTap;
  final String text;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 34,
        width: 34,
        margin: const EdgeInsets.only(left: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(17),
          color: Styles.primaryColor,
        ),
        child: Center(
          child: Text(
            text,
            style: TextStyle(color: Styles.darkGrey),
          ),
        ),
      ),
    );
  }
}
