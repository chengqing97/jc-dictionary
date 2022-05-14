import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View, StatusBar, Pressable, SafeAreaView } from "react-native";
import { useSetRecoilState } from "recoil";
import { darkPrimaryColor, primaryColor } from "../functions/constants";
import { showMenuState } from "../functions/states";

export default function Header() {
  const setShowMenu = useSetRecoilState(showMenuState);

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>简单粗暴</Text>
        <Pressable style={styles.moreButton} onPress={() => setShowMenu((value) => !value)}>
          <Feather name="more-horizontal" size={24} color="black" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: primaryColor,
    paddingTop: StatusBar.currentHeight,
    elevation: 4,
    shadowColor: darkPrimaryColor,
    shadowRadius: 4,
    shadowOpacity: 0.4,
    shadowOffset: { height: 0, width: 0 },
  },
  contentContainer: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontFamily: "Roboto-R",
  },
  moreButton: {
    position: "absolute",
    right: 0,
    padding: 15,
  },
});
