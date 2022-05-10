import { atom } from "recoil";
import { LookupStatus, LookupResult, VoiceUrl } from "./types";

export const lookupStatusState = atom<LookupStatus>({
  key: "lookupStatusState",
  default: "init",
});

export const lookupResultState = atom<LookupResult | null>({
  key: "lookupResultState",
  default: null,
});

export const searchingTextState = atom({
  key: "searchingTextState",
  default: "",
});

export const errorMessageState = atom({
  key: "errorMessageState",
  default: "",
});

export const voiceUrlState = atom<VoiceUrl>({
  key: "",
  default: {},
});
