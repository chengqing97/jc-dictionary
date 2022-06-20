import "expo-dev-client";
import useLoadFonts from "./hooks/useLoadFonts";
import { RecoilRoot } from "recoil";
import { useLoadDatabase } from "./hooks/useLoadDatabase";
import { Context } from "./functions/context";
import HomePage from "./components/HomePage";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

function App() {
  SplashScreen.preventAutoHideAsync();
  const isFontLoaded = useLoadFonts();
  const database = useLoadDatabase();

  useEffect(() => {
    if (isFontLoaded) SplashScreen.hideAsync();
  }, [isFontLoaded]);

  if (!isFontLoaded) return null;
  return (
    <Context.Provider value={database}>
      <HomePage />
    </Context.Provider>
  );
}

export default function AppWrapper() {
  return (
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );
}
