import { StyleSheet, View } from "react-native";
import React from "react";
import Header from "./Header";
import ResultArea from "./ResultArea";
import InputBar from "./InputBar";
import { StatusBar } from "expo-status-bar";
import { showCoffeeState, showMenuState } from "../functions/states";
import { useRecoilValue } from "recoil";
import Menu from "./Menu";
import BuyMeACoffee from "./BuyMeACoffee";

export default function HomePage() {
  const showMenu = useRecoilValue(showMenuState);
  const showCoffee = useRecoilValue(showCoffeeState);

  return (
    <>
      <View style={styles.body}>
        <Header />
        <ResultArea />
        <InputBar />
        <StatusBar style="auto" />
      </View>
      {showMenu && <Menu />}
      {showCoffee && <BuyMeACoffee />}
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
