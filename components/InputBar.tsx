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
import { useRecoilValue } from "recoil";
import { isLoadingVoiceState, playbackObjectState, searchingTextState } from "../functions/states";
import { Audio } from "expo-av";
import usePlayVoice from "../hooks/usePlayVoice";
import useSearch from "../hooks/useSearch";

export default function InputBar() {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const playVoice = usePlayVoice();
  const search = useSearch();
  const searchingText = useRecoilValue(searchingTextState);
  const playbackObject = useRecoilValue(playbackObjectState);
  const isLoadingVoice = useRecoilValue(isLoadingVoiceState);

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
      if (!inputText) {
        setInputText(searchingText);
        // TODO put cursor position to the end
      }
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === "ios"}>
      <SafeAreaView>
        <View style={styles.body}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            selectionColor={Platform.OS === "ios" ? darkPrimaryColor : undefined}
            blurOnSubmit={false}
            autoFocus={Platform.OS === "ios"}
            onSubmitEditing={handleSearch}
            value={inputText}
            onChangeText={(text) => setInputText(text)}
          />
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
