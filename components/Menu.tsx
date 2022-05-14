import React, { useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSetRecoilState } from "recoil";
import { isChinaState, showCoffeeState, showMenuState } from "../functions/states";
import * as Network from "expo-network";
import axios from "axios";

export default function Menu() {
  const setIsChina = useSetRecoilState(isChinaState);
  const setShowMenu = useSetRecoilState(showMenuState);
  const setShowCoffee = useSetRecoilState(showCoffeeState);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", close);
    return BackHandler.removeEventListener("hardwareBackPress", close);
  }, []);

  useEffect(() => {
    (async () => {
      const ip = await Network.getIpAddressAsync();
      const { data } = await axios.get(`https://api.iplocation.net/?ip=${ip}`);
      setIsChina(data.country === "China");
    })();
  }, []);

  function close() {
    setShowMenu(false);
    return undefined;
  }

  return (
    <TouchableWithoutFeedback onPress={close}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.body}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              close();
              setShowCoffee(true);
            }}
          >
            <Text style={styles.buttonText}>Buy me a coffee</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              close();
              Linking.openURL("https://github.com/chengqing97/jc-dictionary");
            }}
          >
            <Text style={styles.buttonText}>About</Text>
          </TouchableOpacity>
          <View style={styles.triangle} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const { width, height } = Dimensions.get("screen");
const triangleHeight = 9;
const triangleWidth = 6;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    width,
    height,
    alignItems: "flex-end",
  },
  body: {
    alignItems: "center",
    backgroundColor: "white",
    marginRight: 8,
    marginTop: 54 + (StatusBar.currentHeight ?? 0),
    borderRadius: 13,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "Roboto-L",
    fontSize: 17,
  },
  triangle: {
    position: "absolute",
    right: 14,
    top: -triangleHeight,
    borderTopWidth: 0,
    borderRightWidth: triangleWidth,
    borderBottomWidth: triangleHeight,
    borderLeftWidth: triangleWidth,
    borderRightColor: "transparent",
    borderBottomColor: "white",
    borderLeftColor: "transparent",
    borderTopColor: "transparent",
  },
});
