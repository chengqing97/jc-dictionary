import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { errorMessageState, lookupResultState, lookupStatusState, searchingTextState } from "../functions/states";
import { useRecoilValue } from "recoil";
import { darkPrimaryColor } from "../functions/constants";

export default function ResultArea() {
  const lookupStatus = useRecoilValue(lookupStatusState);
  const lookupResult = useRecoilValue(lookupResultState);
  const searchingText = useRecoilValue(searchingTextState);
  const errorMessage = useRecoilValue(errorMessageState);

  console.log(lookupResult);

  if (lookupStatus === "init")
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={styles.greetingText}>你好！</Text>
      </View>
    );
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
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
                    <Text style={styles.phonetic}>{`英  ${lookupResult.ukPhonetic}`}</Text>
                    <Text style={styles.phonetic}>{`美  ${lookupResult.usPhonetic}`}</Text>
                  </View>
                )}

                <Text style={styles.definition} selectable>
                  {lookupResult.definition}
                </Text>

                {lookupResult.suggestions && (
                  <>
                    <Text style={styles.suggestionHeader}>您是否要找：</Text>
                    {lookupResult.suggestions.map((item) => {
                      return (
                        <View style={styles.suggestionRow}>
                          <Text style={styles.suggestionText}>{item.word}</Text>
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
  },
  suggestionHeader: {
    fontFamily: "Roboto-R",
    fontSize: 16,
    marginTop: 30,
  },
  suggestionRow: {
    flexDirection: "row",
    height: 16 * 2,
    alignItems: "center",
  },
  suggestionText: {
    fontFamily: "Roboto-M",
    fontSize: 16,
    color: darkPrimaryColor,
  },
  suggestionDefinition: {
    fontFamily: "Roboto-R",
    fontSize: 16,
  },
  noResultText: {
    fontFamily: "Roboto-M",
    fontSize: 18,
    color: darkPrimaryColor,
  },
});
