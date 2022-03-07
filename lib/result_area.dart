import 'package:flutter/material.dart';
import 'styles.dart';
import 'home_page.dart';
import 'package:get/get.dart';
import 'dart:math';

class ResultArea extends StatelessWidget {
  const ResultArea({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Controller c = Get.put(Controller());
    return Obx(() {
      return Expanded(
        child: Stack(
          children: [
            ShaderMask(
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
                slivers: [
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 40),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (c.lookupState.value == LookupState.searching)
                            Text("Looking up ${c.searching.value}...",
                                style: Styles.loadingText)
                          else if (c.lookupState.value == LookupState.error)
                            Text(c.errorText.value, style: Styles.resultText)
                          else if (c.lookupState.value ==
                              LookupState.success) ...[
                            if (c.lookupResult.value!.definition == null &&
                                c.lookupResult.value!.suggestions == null)
                              Text("No result", style: Styles.noResultText),
                            if (c.lookupResult.value!.definition != null) ...[
                              Text(c.lookupResult.value!.keyword,
                                  style: Styles.title),
                              const SizedBox(height: 20),
                              const Phonetics(),
                              const SizedBox(height: 2),
                              SelectableText(c.lookupResult.value!.definition!,
                                  style: Styles.resultText)
                            ],
                            if (c.lookupResult.value?.suggestions != null) ...[
                              if (c.lookupResult.value!.definition != null)
                                const SizedBox(height: 30),
                              Text("您是否要找：", style: Styles.resultText),
                              for (var item
                                  in c.lookupResult.value!.suggestions!) ...[
                                GestureDetector(
                                    onTap: () => c.handleSearch(item.word),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(item.word,
                                            style: Styles.suggestionText),
                                        Text(item.def ?? "",
                                            style: Styles.suggestionDefinition)
                                      ],
                                    )),
                              ]
                            ],
                          ] else if (c.lookupState.value == LookupState.init)
                            Expanded(
                              child: Center(
                                  child:
                                      Text("你好！", style: Styles.welcomeText)),
                            ),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
            // History tag
            if (c.searching.value != "")
              Positioned(
                bottom: 0,
                left: Styles.padding,
                child: GestureDetector(
                  onTap: () {
                    c.inputController.value.text =
                        c.lookupResult.value!.keyword;
                    c.inputController.value.selection =
                        TextSelection.fromPosition(
                            TextPosition(offset: c.inputText.value.length));
                  },
                  child: Container(
                    constraints: BoxConstraints(
                        maxWidth: min(300, MediaQuery.of(context).size.width)),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: Styles.lightGrey, width: 1)),
                    child: Text(
                      c.searching.value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Styles.historyTagText,
                    ),
                  ),
                ),
              )
          ],
        ),
      );
    });
  }
}

class Phonetics extends StatelessWidget {
  const Phonetics({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Controller c = Get.put(Controller());

    if (c.lookupResult.value!.ukPronunciation != null ||
        c.lookupResult.value!.usPronunciation != null) {
      return Row(
        children: [
          if (c.lookupResult.value!.ukPronunciation != null) ...[
            GestureDetector(
              onTap: () => c.playVoice(Accent.uk),
              child: Text("英 ${c.lookupResult.value!.ukPronunciation}",
                  style: c.lookupResult.value!.ukVoice != null
                      ? Styles.phoneticsText
                      : Styles.phoneticsTextDisabled),
            ),
            const SizedBox(width: 10),
          ],
          if (c.lookupResult.value!.usPronunciation != null)
            GestureDetector(
              onTap: () => c.playVoice(Accent.us),
              child: Text("美 ${c.lookupResult.value!.usPronunciation}",
                  style: c.lookupResult.value!.usVoice != null
                      ? Styles.phoneticsText
                      : Styles.phoneticsTextDisabled),
            ),
        ],
      );
    } else {
      return Container();
    }
  }
}
