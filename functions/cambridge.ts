import axios from "axios";
import { VoiceUrl } from "./types";

export async function getVoiceUrl(keyword: string): Promise<VoiceUrl> {
  try {
    const response = (await axios.get(`https://dictionary.cambridge.org/dictionary/english/${keyword}`)).data as string;

    const ukPath = response.match(/media\/english\/uk_pron\/[\S]*.mp3/)?.[0];
    const usPath = response.match(/media\/english\/us_pron\/[\S]*.mp3/)?.[0];

    const host = "https://dictionary.cambridge.org/";

    return {
      uk: !ukPath ? undefined : host + ukPath,
      us: !usPath ? undefined : host + usPath,
    };
  } catch (error) {
    return {};
  }
}
