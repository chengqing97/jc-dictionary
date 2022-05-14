import { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isChinaState, showCoffeeState } from "../functions/states";

export default function BuyMeACoffee() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [savingState, setSavingState] = useState<"" | "saving" | "saved">("");
  const dir = FileSystem.documentDirectory + "wechat-qrcode.jpg";
  const setShowCoffee = useSetRecoilState(showCoffeeState);
  const isChina = useRecoilValue(isChinaState);
  const [status, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    (async () => {
      if (!(await FileSystem.getInfoAsync(dir)).exists) {
        const { uri } = Asset.fromModule(require("../assets/e-wallet/wechat-qrcode.jpg"));
        await FileSystem.downloadAsync(uri, dir);
      }
    })();
  }, []);

  async function saveImage() {
    setSavingState("saving");
    try {
      if (status?.granted || (await requestPermission()).granted) {
        await MediaLibrary.saveToLibraryAsync(dir);
        setSavingState("saved");
      } else {
        Alert.alert("无法保存", "请在您的手机设定中允许简单粗暴实用小词典访问您的相册");
        setShowCoffee(false);
      }
    } catch (error: any) {
      Alert.alert("无法保存", error.message);
      setSavingState("");
    }
  }

  function close() {
    setShowCoffee(false);
  }

  return (
    <Modal transparent onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.body}>
          <ScrollView ref={scrollViewRef} showsHorizontalScrollIndicator={false} horizontal scrollEnabled={false}>
            <View style={styles.page1}>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL("https://qr.alipay.com/fkx09072rs84nibo3ygre99");
                  close();
                }}
              >
                <Image
                  style={[styles.image, { transform: [{ scale: 0.9 }] }]}
                  resizeMode="contain"
                  source={require("../assets/e-wallet/alipay.png")}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                <Image style={styles.image} resizeMode="contain" source={require("../assets/e-wallet/wechatpay.png")} />
              </TouchableOpacity>

              {!isChina && (
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL("https://payment.tngdigital.com.my/sc/bDLnrqxXn9");
                    close();
                  }}
                >
                  <Image
                    style={styles.image}
                    resizeMode="contain"
                    source={require("../assets/e-wallet/touchngo.png")}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.page2}>
              <Image
                style={styles.qrCode}
                resizeMode="contain"
                source={require("../assets/e-wallet/wechat-qrcode.jpg")}
              />
              <View style={styles.buttonsContainer}>
                <Pressable
                  style={[styles.button, { width: 50 }]}
                  hitSlop={{ top: 10, bottom: 10 }}
                  onPress={() => {
                    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
                    setSavingState("");
                  }}
                >
                  <Text style={styles.buttonText}>返回</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, { width: 100 }]}
                  hitSlop={{ top: 10, bottom: 10 }}
                  onPress={saveImage}
                >
                  {savingState === "saving" ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.buttonText}>{savingState === "saved" ? "已保存" : "保存至相册"}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");
const modalWidth = 260;

const styles = StyleSheet.create({
  overlay: {
    width,
    height,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    backgroundColor: "white",
    elevation: 5,
    borderRadius: 15,
    width: modalWidth,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  page1: {
    paddingVertical: 30,
    alignItems: "center",
    width: modalWidth,
    justifyContent: "space-evenly",
  },
  title: {
    fontFamily: "Roboto-R",
    fontSize: 20,
    marginBottom: 30,
  },
  image: {
    width: 160,
    height: 80,
  },

  page2: {
    alignItems: "center",
    justifyContent: "space-evenly",
    width: modalWidth,
  },
  qrCode: {
    width: 160,
    height: (160 * 1680) / 1242,
    borderWidth: 1,
    borderColor: "lightgrey",
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Roboto-R",
    fontSize: 20,
  },
});
