import 'package:flutter/material.dart';
import 'styles.dart';
import 'package:get/get.dart';
import 'home_page.dart';
import 'dart:async';

const double inputHeight = 34;
const double inputBottomPadding = 10;
const double inputTopPadding = 5;

class InputBarController extends FullLifeCycleController {
  final FocusNode focusNode = FocusNode();

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance!.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      focusNode.unfocus();
      Timer(const Duration(milliseconds: 100), () => focusNode.requestFocus());
    }
  }

  @override
  void onClose() {
    WidgetsBinding.instance!.removeObserver(this);
    super.onClose();
  }
}

class InputBar extends StatelessWidget {
  const InputBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Controller c = Get.put(Controller());
    InputBarController ic = Get.put(InputBarController());

    return Obx(() {
      return Stack(
        clipBehavior: Clip.none,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(Styles.padding, inputTopPadding,
                Styles.padding, inputBottomPadding),
            child: Row(
              children: [
                Expanded(
                  // Input Box
                  child: Container(
                    height: inputHeight,
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: Styles.lightGrey, width: 1)),
                    child: Row(
                      children: [
                        Expanded(
                          child: Center(
                            child: TextField(
                              focusNode: ic.focusNode,
                              controller: c.inputController.value,
                              onEditingComplete: c.handleSearch,
                              autofocus: true,
                              style: Styles.inputText,
                              cursorColor: Styles.darkPrimaryColor,
                              cursorWidth: 1.5,
                              textInputAction: TextInputAction.search,
                              decoration: InputDecoration(
                                hintText:
                                    c.lookupState.value == LookupState.init
                                        ? "开始搜索..."
                                        : "",
                                hintStyle: Styles.inputText
                                    .copyWith(color: Styles.lightGrey),
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding:
                                    const EdgeInsets.fromLTRB(14, 0, 5, 0),
                                filled: false,
                              ),
                            ),
                          ),
                        ),
                        if (c.inputText.value.isNotEmpty)
                          GestureDetector(
                            onTap: () => c.inputController.value.clear(),
                            child: Container(
                              height: inputHeight,
                              width: inputHeight,
                              margin: const EdgeInsets.only(right: 3),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(17),
                              ),
                              child: const Center(
                                child: Icon(Icons.close_rounded, size: 16),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                // Voice Buttons
                if (c.lookupResult.value?.ukVoice != null)
                  VoiceButton(
                    onTap: () => c.playVoice(Accent.uk),
                    text: "英",
                  ),
                if (c.lookupResult.value?.usVoice != null)
                  VoiceButton(
                    onTap: () => c.playVoice(Accent.us),
                    text: "美",
                  ),
              ],
            ),
          ),
        ],
      );
    });
  }
}

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
        height: inputHeight,
        width: inputHeight,
        margin: const EdgeInsets.only(left: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(17),
          color: Styles.primaryColor,
        ),
        child: Center(
          child: Text(
            text,
            style: Styles.voiceButtonText,
          ),
        ),
      ),
    );
  }
}
