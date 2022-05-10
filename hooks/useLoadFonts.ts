import * as Font from "expo-font";
import { useEffect, useState } from "react";

export default function useLoadFonts() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts
        await Font.loadAsync({
          "Roboto-L": require("../assets/fonts/Roboto-Light.ttf"),
          "Roboto-R": require("../assets/fonts/Roboto-Regular.ttf"),
          "Roboto-M": require("../assets/fonts/Roboto-Medium.ttf"),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
