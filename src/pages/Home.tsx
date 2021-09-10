import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";

import {
  SQLite,
  SQLiteObject,
  SQLiteTransaction,
} from "@ionic-enterprise/secure-storage";
import { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [db, setDb] = useState<SQLiteObject | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    async function createDb() {
      try {
        const newDb = await SQLite.create({
          name: "mydb",
          location: "default",
          // Key/Password used to encrypt the database
          // Strongly recommended to use Identity Vault to manage this
        });

        setDb(newDb);

        // create tables
        await newDb.executeSql(
          "CREATE TABLE IF NOT EXISTS image(name VARCHAR(256), data BLOB)",
          []
        );
      } catch (e) {
        console.error("Unable to create database", e);
      }
    }

    createDb();
  }, []);

  useEffect(() => {
    if (!db) {
      return;
    }

    async function loadImage() {
      var imgUrl = `https://i.imgur.com/jngirs1.jpeg`;
      const res = await fetch(imgUrl);
      const data = await res.blob();

      var reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onloadend = async () => {
        var base64data = reader.result;
        try {
          await db?.executeSql("INSERT INTO image(name, data) VALUES(?, ?)", [
            "components.png",
            base64data,
          ]);
          console.log("Inserted image!");
        } catch (ex) {
          console.error("Unable to insert blob", ex);
          return;
        }
        try {
          await db?.transaction((tx) => {
            tx.executeSql(
              "SELECT data FROM image LIMIT 1",
              [],
              (tx: any, result: any) => {
                console.log("Selected", result.rowsAffected);
                const d = result.rows.item(0);
                console.log("Got data", d);
                setImageData(d.data);
              }
            );
          });
        } catch (ex) {
          console.error("Unable to select image", ex);
        }
      };
    }

    loadImage();
  }, [db]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        {imageData && <img src={imageData} />}
      </IonContent>
    </IonPage>
  );
};

export default Home;
