import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { darkPrimaryColor, primaryColor } from "../functions/constants";
import { useRecoilValue } from "recoil";
import { isLoadingVoiceState, lookupStatusState, playbackObjectState, searchingTextState } from "../functions/states";
import { Audio } from "expo-av";
import usePlayVoice from "../hooks/usePlayVoice";
import useSearch from "../hooks/useSearch";
import { Feather } from "@expo/vector-icons";

export default function InputBar() {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const playVoice = usePlayVoice();
  const search = useSearch();
  const searchingText = useRecoilValue(searchingTextState);
  const playbackObject = useRecoilValue(playbackObjectState);
  const isLoadingVoice = useRecoilValue(isLoadingVoiceState);
  const lookupStatus = useRecoilValue(lookupStatusState);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  async function handleSearch() {
    setInputText("");
    try {
      await search(inputText);
    } catch (error) {
      if (!inputText) setInputText(searchingText);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === "ios"}>
      <SafeAreaView>
        <View style={styles.body}>
          <View style={styles.inputBox}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              selectionColor={Platform.OS === "ios" ? darkPrimaryColor : undefined}
              blurOnSubmit={false}
              placeholder={lookupStatus === "init" ? "开始搜索..." : undefined}
              autoFocus={Platform.OS === "ios"}
              onSubmitEditing={handleSearch}
              value={inputText}
              onChangeText={(text) => setInputText(text)}
            />
            {!!inputText && (
              <Pressable style={styles.clearButton} onPress={() => setInputText("")}>
                <Feather name="x" size={18} color="black" />
              </Pressable>
            )}
          </View>
          {!isLoadingVoice && playbackObject.uk && (
            <Pressable style={styles.voiceButton} onPress={() => playVoice("uk")}>
              <Text style={styles.voiceButtonText}>英</Text>
            </Pressable>
          )}
          {!isLoadingVoice && playbackObject.us && (
            <Pressable style={styles.voiceButton} onPress={() => playVoice("us")}>
              <Text style={styles.voiceButtonText}>美</Text>
            </Pressable>
          )}
          {!!searchingText && (
            <Pressable style={styles.tagButton} hitSlop={5} onPress={() => setInputText(searchingText)}>
              <Text style={styles.tagButtonText} numberOfLines={1} textBreakStrategy="highQuality">
                {searchingText}
              </Text>
            </Pressable>
          )}
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
    paddingTop: 0,
  },
  inputBox: {
    borderRadius: inputBoxHeight / 2,
    borderWidth: 1,
    borderColor: "lightgrey",
    height: inputBoxHeight,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontFamily: "Roboto-R",
    fontSize: 16,
    paddingLeft: inputBoxHeight / 3,
    paddingRight: 5,
  },
  clearButton: {
    height: inputBoxHeight,
    paddingRight: 10,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
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

  tagButton: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 3,
    position: "absolute",
    bottom: inputBoxHeight + gap * 1.5,
    left: gap,
    maxWidth: Math.min(300, Dimensions.get("screen").width),
    backgroundColor: "white",
  },
  tagButtonText: {
    fontFamily: "Roboto-R",
    fontSize: 14,
  },
});
