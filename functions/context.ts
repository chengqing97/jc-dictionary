import { WebSQLDatabase } from "expo-sqlite";
import { createContext } from "react";

export const Context = createContext<WebSQLDatabase | null>(null);
