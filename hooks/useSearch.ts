import { axiosControllerState, databaseState } from "./../functions/states";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
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
import * as SQLite from "expo-sqlite";
import { useContext } from "react";
import { Context } from "../functions/context";
import { LookupResult } from "../functions/types";

export default function useSearch() {
  const setLookupResult = useSetRecoilState(lookupResultState);
  const setLookupStatus = useSetRecoilState(lookupStatusState);
  const setIsLoadingVoice = useSetRecoilState(isLoadingVoiceState);
  const setSearchingText = useSetRecoilState(searchingTextState);
  const setErrorMessage = useSetRecoilState(errorMessageState);
  const setPlaybackObject = useSetRecoilState(playbackObjectState);
  const [axiosController, setAxiosController] = useRecoilState(axiosControllerState);
  const database = useContext(Context);

  async function handleSearch(toSearch: string, searchOnYoudao?: boolean) {
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

    if (database && !searchOnYoudao) {
      database?.transaction((tx) => {
        tx.executeSql(
          "SELECT phonetic, translation FROM stardict WHERE word = ?;",
          [toSearch.toLocaleLowerCase().trim()],
          (_, { rows }) => {
            if (rows.length > 0 && rows.item(0).translation) {
              const result: LookupResult = {
                keyword: toSearch,
                usPhonetic: rows.item(0).phonetic ? `[${rows.item(0).phonetic}]` : undefined,
                definition: rows.item(0).translation,
                isLocal: true,
              };
              setLookupResult(result);
              setLookupStatus("success");
            } else {
              console.log("No local result, searching on youdao");
              searchOnYoudaoAsync();
            }
          }
        );
      });
    } else {
      console.log("searching on youdao");
      searchOnYoudaoAsync();
    }

    async function searchOnYoudaoAsync() {
      try {
        const response = await axios.get(`https://dict.youdao.com/w/${toSearch}`, {
          signal: controller.signal,
        });
        const data = response.data as string;
        const result = grabResult(toSearch, data);
        setLookupResult(result);
        setLookupStatus("success");
      } catch (error: any) {
        if (error.code === "ERR_CANCELED") console.log("cancelled", toSearch);
        else {
          setErrorMessage(error.message);
          setLookupStatus("error");
          throw error;
        }
      }
    }
  }

  return handleSearch;
}
