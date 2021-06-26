import * as firebase from "firebase";

import "firebase/storage";
import "firebase/firestore";

// firebase verileri
const firebaseConfig = {
  apiKey: "AIzaSyDk4hlweAeRS8BEVrOKAvmPzJzQy9t9qOM",
    authDomain: "uygulama-firebase.firebaseapp.com",
    databaseURL: "https://uygulama-firebase-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "uygulama-firebase",
    storageBucket: "uygulama-firebase.appspot.com",
    messagingSenderId: "183610078498",
    appId: "1:183610078498:web:3d6cde7a402b5c8ba1e17b"
};

firebase.initializeApp(firebaseConfig);

export const storage = firebase.storage();
export const firestore = firebase.firestore();

// cloud function'a veri gönderen fonksiyon
export const detect = data => {
  return fetch("https://europe-west3-uygulama-firebase.cloudfunctions.net/detect", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });
};

//firestore'a sonuç gönderen fonksiyon
export const store = data => {
  firestore.collection("detections").add(data);
};
