import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { darkPrimaryColor, primaryColor } from "../functions/constants";
import { lookup } from "../functions/youdao";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  errorMessageState,
  lookupResultState,
  lookupStatusState,
  searchingTextState,
  voiceUrlState,
} from "../functions/states";
import { getVoiceUrl } from "../functions/cambridge";

export default function InputBar() {
  const [inputText, setInputText] = useState("");
  const [lookupResult, setLookupResult] = useRecoilState(lookupResultState);
  const [lookupStatus, setLookupStatus] = useRecoilState(lookupStatusState);
  const [isGettingVoiceUrl, setIsGettingVoiceUrl] = useState(false);
  const [searchingText, setSearchingText] = useRecoilState(searchingTextState);
  const [voiceUrl, setVoiceUrl] = useRecoilState(voiceUrlState);
  const setErrorMessage = useSetRecoilState(errorMessageState);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  async function handleSearch(specialSearch?: string) {
    var toSearch = specialSearch ?? inputText;

    if (!toSearch) return;

    if (lookupStatus == "searching") {
      // TODO cancel request
    }
    if (isGettingVoiceUrl) {
      // TODO cancel request
    }

    setInputText("");
    setSearchingText(toSearch);
    setLookupStatus("searching");
    setLookupResult(null);
    setVoiceUrl({});
    setErrorMessage("");

    try {
      await getVoice(toSearch);
      const result = await lookup(toSearch);
      setLookupResult(result);
      setLookupStatus("success");
    } catch (error: any) {
      // TODO ignore error when user cancel request
      setErrorMessage(error.message);
      if (!inputText) {
        setInputText(searchingText);
        // TODO put cursor position to the end
      }
      setLookupStatus("error");
    }
  }

  async function getVoice(toSearch: string) {
    try {
      setIsGettingVoiceUrl(true);
      const urls = await getVoiceUrl(toSearch);

      setVoiceUrl(urls);
      if (urls.uk) {
        //TODO load voice
      }
      if (urls.us) {
        //TODO load voice
      }
    } finally {
      setIsGettingVoiceUrl(false);
    }
  }

  async function playVoice(accent: "us" | "uk") {
    if (!lookupResult) return;
    if (accent == "uk" && voiceUrl.uk) {
      // TODO play voice
      // if (!ukPlayerIsLoaded) {
      //   await ukPlayerFuture;
      //   ukPlayerIsLoaded = true;
      // }
      // await ukPlayer.seek(Duration.zero);
      // await ukPlayer.play();
      // ukPlayer.stop();
    }
    if (accent == "us" && voiceUrl.us) {
      // TODO play voice
      // if (!usPlayerIsLoaded) {
      //   await usPlayerFuture;
      //   usPlayerIsLoaded = true;
      // }
      // await usPlayer.seek(Duration.zero);
      // await usPlayer.play();
      // usPlayer.stop();
    }
  }
  return (
    <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === "ios"}>
      <SafeAreaView>
        <View style={styles.body}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            selectionColor={Platform.OS === "ios" ? darkPrimaryColor : "grey"}
            blurOnSubmit={false}
            autoFocus={Platform.OS === "ios"}
            onSubmitEditing={() => handleSearch()}
            value={inputText}
            onChangeText={(text) => setInputText(text)}
          />
          <Pressable style={styles.voiceButton} onPress={() => playVoice("uk")}>
            <Text style={styles.voiceButtonText}>英</Text>
          </Pressable>
          <Pressable style={styles.voiceButton} onPress={() => playVoice("us")}>
            <Text style={styles.voiceButtonText}>美</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const inputBoxHeight = 36;
const gap = 10;

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    alignItems: "center",
    padding: gap,
  },
  textInput: {
    borderRadius: inputBoxHeight,
    borderWidth: 1,
    flex: 1,
    height: inputBoxHeight,
    borderColor: "lightgrey",
    fontFamily: "Roboto-R",
    fontSize: 16,
    paddingHorizontal: inputBoxHeight / 3,
  },
  voiceButton: {
    height: inputBoxHeight,
    width: inputBoxHeight,
    borderRadius: inputBoxHeight / 2,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: gap,
  },
  voiceButtonText: {
    fontFamily: "Roboto-R",
    fontSize: 16,
  },
});
