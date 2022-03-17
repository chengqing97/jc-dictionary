import 'package:flutter/material.dart';
import 'styles.dart';
import 'package:get/get.dart';
import 'home_page.dart';
import 'dart:async';
import 'dart:io' show Platform;

const double inputHeight = 34;
const double inputBottomPadding = 10;
const double inputTopPadding = 5;

class InputBarController extends FullLifeCycleController {
  final FocusNode focusNode = FocusNode();

  @override
  void onInit() {
    super.onInit();
    if (!Platform.isIOS)
      Timer(const Duration(milliseconds: 100), () => focusNode.requestFocus());
    WidgetsBinding.instance!.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (Platform.isIOS) return;
    if (state == AppLifecycleState.resumed) {
      Timer(const Duration(milliseconds: 100), () => focusNode.requestFocus());
    } else {
      focusNode.unfocus();
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
                              controller: c.inputController,
                              onEditingComplete: c.handleSearch,
                              autofocus: Platform.isIOS,
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
                            onTap: () => c.inputController.clear(),
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
                if (c.voiceUrl.value.uk != null) const VoiceButton(Accent.uk),
                if (c.voiceUrl.value.us != null) const VoiceButton(Accent.us),
              ],
            ),
          ),
        ],
      );
    });
  }
}

class VoiceButton extends StatefulWidget {
  const VoiceButton(this.accent, {Key? key}) : super(key: key);

  final Accent accent;

  @override
  State<VoiceButton> createState() => _VoiceButtonState();
}

class _VoiceButtonState extends State<VoiceButton> {
  var isPlaying = false;
  @override
  Widget build(BuildContext context) {
    final c = Get.put(Controller());
    return Row(
      children: [
        const SizedBox(width: 12),
        GestureDetector(
          onTap: () async {
            setState(() => isPlaying = true);
            await c.playVoice(widget.accent);
            setState(() => isPlaying = false);
          },
          child: Stack(
            children: [
              Container(
                height: inputHeight,
                width: inputHeight,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(17),
                  color: Styles.primaryColor,
                ),
                child: Center(
                  child: Text(
                    widget.accent == Accent.uk ? "英" : "美",
                    style: Styles.voiceButtonText,
                  ),
                ),
              ),
              if (isPlaying)
                SizedBox(
                  height: inputHeight - 1,
                  width: inputHeight - 1,
                  child: CircularProgressIndicator(
                    color: Styles.darkPrimaryColor,
                    strokeWidth: 1,
                  ),
                )
            ],
          ),
        ),
      ],
    );
  }
}
