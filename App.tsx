import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import useLoadFonts from "./hooks/useLoadFonts";

import Header from "./components/Header";
import ResultArea from "./components/ResultArea";
import InputBar from "./components/InputBar";
import { RecoilRoot } from "recoil";

export default function App() {
  const isFontLoaded = useLoadFonts();

  if (!isFontLoaded) return null;
  return (
    <RecoilRoot>
      <View style={styles.body}>
        <Header />
        <ResultArea />
        <InputBar />
        <StatusBar style="auto" />
      </View>
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
