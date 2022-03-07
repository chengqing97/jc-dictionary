import 'package:get/get.dart';
import 'home_page.dart';

enum Accent { uk, us }

void playVoice(Accent accent) async {
  final Controller c = Get.put(Controller());
  if (c.lookupResult.value == null) return;
  if (accent == Accent.uk && c.lookupResult.value!.ukVoice != null) {
    await c.player.setUrl(c.lookupResult.value!.ukVoice!);
    c.player.play();
  }
  if (accent == Accent.us && c.lookupResult.value!.usVoice != null) {
    await c.player.setUrl(c.lookupResult.value!.ukVoice!);
    c.player.play();
  }
}
