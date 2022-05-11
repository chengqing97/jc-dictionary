import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import React from "react";
import {
  errorMessageState,
  lookupResultState,
  lookupStatusState,
  searchingTextState,
  playbackObjectState,
  isLoadingVoiceState,
} from "../functions/states";
import { useRecoilValue } from "recoil";
import { darkPrimaryColor } from "../functions/constants";
import usePlayVoice from "../hooks/usePlayVoice";
import useSearch from "../hooks/useSearch";

export default function ResultArea() {
  const lookupStatus = useRecoilValue(lookupStatusState);
  const lookupResult = useRecoilValue(lookupResultState);
  const searchingText = useRecoilValue(searchingTextState);
  const errorMessage = useRecoilValue(errorMessageState);
  const playVoice = usePlayVoice();
  const search = useSearch();
  const playbackObject = useRecoilValue(playbackObjectState);
  const isLoadingVoice = useRecoilValue(isLoadingVoiceState);

  if (lookupStatus === "init")
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={styles.greetingText}>你好！</Text>
      </View>
    );
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {(() => {
        if (lookupStatus === "searching")
          return <Text style={styles.loadingText}>{`Looking up ${searchingText}...`}</Text>;
        if (lookupStatus === "error") return <Text style={styles.errorText}>{errorMessage}</Text>;
        if (lookupStatus === "success" && lookupResult) {
          if (lookupResult.definition || lookupResult?.suggestions)
            return (
              <>
                <Text style={styles.title}>{lookupResult.keyword}</Text>

                {(lookupResult.ukPhonetic || lookupResult.usPhonetic) && (
                  <View style={styles.phoneticContainer}>
                    {lookupResult.ukPhonetic && (
                      <Pressable
                        onPress={() => playVoice("uk")}
                        hitSlop={{ top: 10, bottom: 10 }}
                        disabled={!playbackObject.uk}
                      >
                        <Text
                          style={[styles.phonetic, { color: playbackObject.uk ? darkPrimaryColor : "grey" }]}
                        >{`英  ${lookupResult.ukPhonetic}`}</Text>
                      </Pressable>
                    )}
                    {lookupResult.usPhonetic && (
                      <Pressable
                        onPress={() => playVoice("us")}
                        hitSlop={{ top: 10, bottom: 10 }}
                        disabled={!playbackObject.us}
                      >
                        <Text
                          style={[styles.phonetic, { color: playbackObject.us ? darkPrimaryColor : "grey" }]}
                        >{`美  ${lookupResult.usPhonetic}`}</Text>
                      </Pressable>
                    )}
                    {isLoadingVoice && <ActivityIndicator color={"grey"} />}
                  </View>
                )}

                <Text style={styles.definition} selectable>
                  {lookupResult.definition}
                </Text>

                {lookupResult.suggestions && (
                  <>
                    <Text style={styles.suggestionHeader}>您是否要找：</Text>
                    {lookupResult.suggestions.map((item, index) => {
                      return (
                        <View style={styles.suggestionRow} key={index}>
                          <Pressable onPress={() => search(item.word)}>
                            <Text style={styles.suggestionText}>{item.word}</Text>
                          </Pressable>
                          <Text style={styles.suggestionDefinition}>{item.def}</Text>
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            );
          return <Text style={styles.noResultText}>No result</Text>;
        }
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  greetingText: {
    fontFamily: "Roboto-R",
    fontSize: 18,
  },
  loadingText: {
    fontFamily: "Roboto-R",
    fontSize: 16,
    color: "grey",
  },
  errorText: {
    fontFamily: "Roboto-R",
    fontSize: 16,
    color: "red",
  },
  title: {
    fontFamily: "Roboto-M",
    fontSize: 24,
    marginBottom: 20,
  },
  phoneticContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  phonetic: {
    fontFamily: "Roboto-R",
    fontSize: 16,
    color: darkPrimaryColor,
    marginRight: 10,
  },
  definition: {
    fontFamily: "Roboto-R",
    fontSize: 16,
    marginBottom: 30,
  },
  suggestionHeader: {
    fontFamily: "Roboto-R",
    fontSize: 16,
  },
  suggestionRow: {
    marginTop: 8,
  },
  suggestionText: {
    fontFamily: "Roboto-M",
    fontSize: 18,
    color: darkPrimaryColor,
  },
  suggestionDefinition: {
    fontFamily: "Roboto-R",
    fontSize: 16,
    marginBottom: 30,
  },
  noResultText: {
    fontFamily: "Roboto-M",
    fontSize: 18,
    color: darkPrimaryColor,
  },
});
