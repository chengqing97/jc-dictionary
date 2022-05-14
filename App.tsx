import "expo-dev-client";
import useLoadFonts from "./hooks/useLoadFonts";
import { RecoilRoot } from "recoil";
import { useLoadDatabase } from "./hooks/useLoadDatabase";
import { Context } from "./functions/context";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomePage from "./components/HomePage";

export default function App() {
  const isFontLoaded = useLoadFonts();
  const database = useLoadDatabase();

  if (!isFontLoaded) return null;
  return (
    <Context.Provider value={database}>
      <RecoilRoot>
        <SafeAreaProvider>
          <HomePage />
        </SafeAreaProvider>
      </RecoilRoot>
    </Context.Provider>
  );
}
