import { atom } from "recoil";
import { LookupStatus, LookupResult } from "./types";
import { Audio } from "expo-av";

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

export const playbackObjectState = atom<{ uk?: Audio.Sound; us?: Audio.Sound }>({
  key: "playbackObjectState",
  default: {},
});

export const isLoadingVoiceState = atom({
  key: "isLoadingVoiceState",
  default: false,
});

export const axiosControllerState = atom({
  key: "axiosControllerState",
  default: new AbortController(),
});
