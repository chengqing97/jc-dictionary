import { databaseStatusState } from "./../functions/states";
import { useSetRecoilState } from "recoil";
import { Platform } from "react-native";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { unzip } from "react-native-zip-archive";

export function useLoadDatabase() {
  const [database, setDatabase] = useState<SQLite.WebSQLDatabase | null>(null);
  const setDatabaseStatus = useSetRecoilState(databaseStatusState);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") return;

      const DOCUMENT_DIR = FileSystem.documentDirectory;
      const CACHE_DIR =
        FileSystem.cacheDirectory?.startsWith("file://") && Platform.OS === "ios"
          ? FileSystem.cacheDirectory.slice(7)
          : FileSystem.cacheDirectory;

      try {
        setDatabaseStatus((s) => s + "\nprogram started");
        if (!(await FileSystem.getInfoAsync(DOCUMENT_DIR + "SQLite/stardict.db")).exists) {
          setDatabaseStatus((s) => s + "\ngetting asset uri");
          const uri = encodeURI(Asset.fromModule(require("../assets/ecdict-sqlite-28.zip")).uri);
          console.log(uri);
          setDatabaseStatus((s) => s + "\n" + uri);

          //uri.startsWith("file://") && Platform.OS === "ios" ? uri.slice(7) :
          const zipFile = await FileSystem.downloadAsync(uri, CACHE_DIR + "ecdict-sqlite-28.zip");
          console.log("zip file is copied.");
          setDatabaseStatus((s) => s + "\n" + "zip file is copied.");

          if (!(await FileSystem.getInfoAsync(DOCUMENT_DIR + "SQLite")).exists) {
            await FileSystem.makeDirectoryAsync(DOCUMENT_DIR + "SQLite");
          }

          const dbFilePath = await unzip(zipFile.uri, DOCUMENT_DIR + "SQLite");
          console.log("done unzip: ", dbFilePath);
          setDatabaseStatus((s) => s + "\n" + `done unzip: ${dbFilePath}`);

          await FileSystem.deleteAsync(zipFile.uri);
          console.log("zip file is deleted");
          setDatabaseStatus((s) => s + "\n" + "zip file is deleted");
        } else {
          console.log("db file exist");
          setDatabaseStatus((s) => s + "\n" + "db file exist");
        }
        setDatabase(SQLite.openDatabase("stardict.db"));
        console.log("database is ready");
        setDatabaseStatus((s) => s + "\n" + "database is ready");
      } catch (error) {
        console.log("load database error");
        console.log(error);
        setDatabaseStatus((s) => s + "\n" + `load database error: ${error}`);
        await FileSystem.deleteAsync(DOCUMENT_DIR + "SQLite", { idempotent: true });
      }
    })();
    return () => {
      database?.closeAsync();
      console.log("database closed");
    };
  }, []);

  return database;
}
