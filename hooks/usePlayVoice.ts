import { playbackObjectState } from "./../functions/states";
import { useRecoilValue } from "recoil";

export default function usePlayVoice() {
  const playbackObject = useRecoilValue(playbackObjectState);

  async function playVoice(accent: "us" | "uk") {
    if (accent == "uk" && playbackObject.uk) {
      await playbackObject.uk.replayAsync();
    }
    if (accent == "us" && playbackObject.us) {
      await playbackObject.us.replayAsync();
    }
  }

  return playVoice;
}
