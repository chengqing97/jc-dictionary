import { StyleSheet, Text, View, StatusBar, SafeAreaView } from "react-native";
import { primaryColor } from "../functions/constants";

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
  },
  contentContainer: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontFamily: "Roboto-R",
  },
});
