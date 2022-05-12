import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import useLoadFonts from "./hooks/useLoadFonts";
import { RecoilRoot } from "recoil";
import { useLoadDatabase } from "./hooks/useLoadDatabase";
import { Context } from "./functions/context";

import Header from "./components/Header";
import ResultArea from "./components/ResultArea";
import InputBar from "./components/InputBar";

export default function App() {
  const isFontLoaded = useLoadFonts();
  const database = useLoadDatabase();

  if (!isFontLoaded) return null;
  return (
    <Context.Provider value={database}>
      <RecoilRoot>
        <View style={styles.body}>
          <Header />
          <ResultArea />
          <InputBar />
          <StatusBar style="auto" />
        </View>
      </RecoilRoot>
    </Context.Provider>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
