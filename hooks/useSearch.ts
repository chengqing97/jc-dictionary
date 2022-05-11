import { axiosControllerState } from "./../functions/states";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  errorMessageState,
  isLoadingVoiceState,
  lookupResultState,
  lookupStatusState,
  playbackObjectState,
  searchingTextState,
} from "../functions/states";
import { grabResult } from "../functions/youdao";
import { grabVoiceUrl } from "../functions/cambridge";
import { Audio } from "expo-av";
import axios from "axios";

export default function useSearch() {
  const setLookupResult = useSetRecoilState(lookupResultState);
  const setLookupStatus = useSetRecoilState(lookupStatusState);
  const setIsLoadingVoice = useSetRecoilState(isLoadingVoiceState);
  const setSearchingText = useSetRecoilState(searchingTextState);
  const setErrorMessage = useSetRecoilState(errorMessageState);
  const setPlaybackObject = useSetRecoilState(playbackObjectState);
  const [axiosController, setAxiosController] = useRecoilState(axiosControllerState);

  async function handleSearch(toSearch: string) {
    if (!toSearch) return;

    const controller = new AbortController();

    axiosController.abort();
    setAxiosController(controller);
    setSearchingText(toSearch);
    setLookupStatus("searching");
    setLookupResult(null);
    setErrorMessage("");
    setIsLoadingVoice(true);
    setPlaybackObject({});

    axios
      .get(`https://dictionary.cambridge.org/dictionary/english/${toSearch}`, {
        signal: controller.signal,
      })
      .then(async (response) => {
        const data = response.data as string;
        const urls = grabVoiceUrl(data);
        await Promise.all([
          urls.uk
            ? Audio.Sound.createAsync({ uri: urls.uk }).then(({ sound }) =>
                setPlaybackObject((obj) => ({ ...obj, uk: sound }))
              )
            : () => {},
          urls.us
            ? Audio.Sound.createAsync({ uri: urls.us }).then(({ sound }) =>
                setPlaybackObject((obj) => ({ ...obj, us: sound }))
              )
            : () => {},
        ]);
      })
      .finally(() => {
        setIsLoadingVoice(false);
      });

    axios
      .get(`https://dict.youdao.com/w/${toSearch}`, {
        signal: controller.signal,
      })
      .then((response) => {
        const data = response.data as string;
        const result = grabResult(toSearch, data);
        setLookupResult(result);
        setLookupStatus("success");
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") console.log("cancelled", toSearch);
        else {
          setErrorMessage(error.message);
          setLookupStatus("error");
          throw error;
        }
      });
  }

  return handleSearch;
}
