import { Platform } from "react-native";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { unzip } from "react-native-zip-archive";

export function useLoadDatabase() {
  const [database, setDatabase] = useState<SQLite.WebSQLDatabase | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") return;
      try {
        if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")).exists) {
          await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "SQLite");
        }
        if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite/stardict.db")).exists) {
          const uri = Asset.fromModule(require("../assets/ecdict-sqlite-28.zip")).uri;
          console.log(uri);
          const zipFile = await FileSystem.downloadAsync(
            uri,
            FileSystem.documentDirectory + "SQLite/ecdict-sqlite-28.zip"
          );
          console.log("zip file is copied.");
          const dbFilePath = await unzip(zipFile.uri, FileSystem.documentDirectory + "SQLite");
          console.log("done unzip: ", dbFilePath);
          await FileSystem.deleteAsync(zipFile.uri);
          console.log("zip file is deleted");
        } else {
          console.log("db file exist");
        }
        setDatabase(SQLite.openDatabase("stardict.db"));
        console.log("database is ready");
      } catch (error) {
        console.log("load database error");
        console.log(error);
        await FileSystem.deleteAsync(FileSystem.documentDirectory + "SQLite", { idempotent: true });
      }
    })();
    return () => {
      database?.closeAsync();
      console.log("database closed");
    };
  }, []);

  return database;
}
