import { StyleSheet, Text, View, StatusBar, SafeAreaView } from "react-native";
import { darkPrimaryColor, primaryColor } from "../functions/constants";

export default function Header() {
  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>简单粗暴</Text>
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
});
