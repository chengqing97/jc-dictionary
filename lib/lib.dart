import 'package:http/http.dart' as http;

enum Status { success, noResult }

class Suggestion {
  String word;
  String? def;
  Suggestion(this.word, this.def);

  @override
  toString() {
    return "word: $word, def: $def";
  }
}

class LookupResult {
  String keyword;
  String? ukPronunciation;
  String? usPronunciation;
  String? definition;
  List<Suggestion>? suggestions;
  String? ukVoice;
  String? usVoice;

  LookupResult(
      {required this.keyword,
      this.ukPronunciation,
      this.usPronunciation,
      this.definition,
      this.suggestions,
      this.ukVoice,
      this.usVoice});

  @override
  toString() {
    return "keyword: $keyword, ukPronunciation: $ukPronunciation, usPronunciation: $usPronunciation, definition: $definition, suggestions: $suggestions, uskVoice: $usVoice, ukVoice: $usVoice";
  }
}

Future<LookupResult> lookup(String toSearch, http.Client client) async {
  final url = Uri.parse("https://dict.youdao.com/w/$toSearch");
  try {
    var response = await client.read(url);

    final isTranslate = RegExp(r'<div id="fanyiToggle">').hasMatch(response);

    if (isTranslate) {
      return LookupResult(
          keyword: toSearch, definition: grabTranslation(response));
    }

    final isChinese = RegExp(r'英语怎么说').hasMatch(response);

    if (isChinese) {
      return LookupResult(
          keyword: toSearch, definition: grabEnglishWords(response));
    }

    final hasResult = RegExp(r'<h2 class="wordbook-js">').hasMatch(response);
    final hasSuggestion = RegExp(r'您要找的是不是').hasMatch(response);

    if (hasResult || hasSuggestion) {
      VoiceUrl voiceUrl;
      try {
        voiceUrl = await getVoiceUrl(toSearch, client);
      } catch (_) {
        voiceUrl = VoiceUrl();
      }

      return LookupResult(
        keyword: toSearch,
        ukPronunciation: grabUkPronunciation(response),
        usPronunciation: grabUsPronunciation(response),
        definition: hasResult ? grabFormalDefinition(response) : null,
        suggestions: hasSuggestion ? grabSuggestion(response) : null,
        ukVoice: voiceUrl.uk,
        usVoice: voiceUrl.us,
      );
    }

    return LookupResult(keyword: toSearch);
  } catch (error) {
    rethrow;
  }
}

String? grabTranslation(String response) {
  final definitionPart =
      RegExp(r'(?<=<div class="trans-container">)[\s\S]*?(?=</div>)')
          .firstMatch(response)
          ?.group(0);

  if (definitionPart == null) return null;

  final definition = RegExp(r'(?<=<p>).*(?=</p>)')
      .allMatches(definitionPart)
      .toList()[1]
      .group(0);
  return definition;
}

String? grabEnglishWords(String response) {
  final definitionPart =
      RegExp(r'(?<=<div class="trans-container">)[\s\S]*?(?=</div>)')
          .firstMatch(response)
          ?.group(0);
  final definitionsRaw = RegExp(r'(?<=<p class="wordGroup">)[\s\S]*?(?=</p>)')
      .allMatches(definitionPart ?? "");
  var definitionLines = <String>[];
  for (var item in definitionsRaw) {
    final wordType = RegExp(r'(?<=;">)[\s\S]*?(?=</span>)')
        .firstMatch(item.group(0) ?? "")
        ?.group(0);
    final def = RegExp(r'(?<=E2Ctranslation">)[\s\S]*?(?=</a>)')
        .firstMatch(item.group(0) ?? "")
        ?.group(0);
    var definitionLine = "";
    if (wordType != null && !wordType.contains(";"))
      definitionLine += "$wordType ";
    definitionLine += "$def";
    definitionLines.add(definitionLine);
  }
  if (definitionLines.isEmpty) return null;
  var definition = definitionLines.join('\n');
  return definition;
}

String? grabFormalDefinition(String response) {
  final definitionPart =
      RegExp(r'(?<=<div class="trans-container">\s*<ul>)[\s\S]*?(?=</ul>)')
          .firstMatch(response)
          ?.group(0);
  final definitionsRaw =
      RegExp(r'(?<=<li>)[\s\S]*?(?=</li>)').allMatches(definitionPart ?? "");
  if (definitionsRaw.isEmpty) return null;
  final definition =
      definitionsRaw.map((item) => item.group(0) ?? "").join("\n");

  return definition;
}

String? grabUkPronunciation(String response) {
  final ukPronunciation = RegExp(
          r'(?<=<span class="pronounce">英[\s\S]*<span class="phonetic">)[\s\S]*?(?=</span>)')
      .firstMatch(response)
      ?.group(0);
  return ukPronunciation;
}

String? grabUsPronunciation(String response) {
  final usPronunciation = RegExp(
          r'(?<=<span class="pronounce">美[\s\S]*<span class="phonetic">)[\s\S]*?(?=</span>)')
      .firstMatch(response)
      ?.group(0);
  return usPronunciation;
}

List<Suggestion>? grabSuggestion(String response) {
  final suggestionsRaw =
      RegExp(r'(?<=<p class="typo-rel">)[\s\S]*?(?=</p>)').allMatches(response);
  if (suggestionsRaw.isEmpty) return null;
  var suggestions = <Suggestion>[];

  for (var item in suggestionsRaw) {
    final word = RegExp(r'(?<=class="search-js">)[\s\S]*?(?=</a></span>)')
        .firstMatch(item.group(0) ?? "")
        ?.group(0);
    final def = RegExp(r'(?<=</span>)[\s\S]*')
        .firstMatch(item.group(0) ?? "")
        ?.group(0)
        ?.trim();

    if (word != null) suggestions.add(Suggestion(word, def));
  }
  if (suggestions.isEmpty) return null;
  return suggestions;
}

class VoiceUrl {
  String? uk;
  String? us;

  VoiceUrl({this.uk, this.us});
}

Future<VoiceUrl> getVoiceUrl(String keyword, http.Client client) async {
  final url =
      Uri.parse("https://dictionary.cambridge.org/dictionary/english/$keyword");
  var response = await client.read(url, headers: {"user-agent": 'curl/7.77.0'});

  var ukPath =
      RegExp(r"media/english/uk_pron/[\S]*.mp3").firstMatch(response)?.group(0);
  var usPath =
      RegExp(r"media/english/us_pron/[\S]*.mp3").firstMatch(response)?.group(0);

  const host = "https://dictionary.cambridge.org/";

  return VoiceUrl(
      uk: ukPath == null ? null : host + ukPath,
      us: usPath == null ? null : host + usPath);
}
