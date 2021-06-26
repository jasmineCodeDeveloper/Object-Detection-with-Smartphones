import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import tailwind from "tailwind-rn";
import { Ionicons } from "@expo/vector-icons";
// kamera önizlemesini gösteren component
import { Camera } from "expo-camera";

export default function Kamera({ onPictureReady }) {
  const camera = useRef();
  // ön arka kamera tipi: "back" ya da "front"
  const [type, setType] = useState("back");

  // component gözükünce kamera kullanım izni yoksa iste
  useEffect(() => {
    Camera.requestPermissionsAsync().then(
      status => status || alert("Kamera izni verilmedi!")
    );
  }, []);

  // fotoğraf çekme butonuna basılınca yapılacaklar
  const takePicture = () => {
    if (!camera) return;
    // onPictureReady propunda verilen fonksiyonu çekilen resim ile çalıştır
    camera.current
      .takePictureAsync({ pauseAfterCapture: true, quality: 0.8 })
      .then(onPictureReady);
  };

  return (
    <View style={tailwind("flex-1 w-full")}>
      <Camera style={tailwind("flex-1 w-full")} ref={camera} type={type} />

      <TouchableOpacity
        onPress={takePicture}
        style={[
          tailwind(
            "absolute rounded-full bg-white bg-opacity-75 w-16 h-16 self-center items-center justify-center"
          ),
          { bottom: 5 },
        ]}
      >
        <Ionicons name="md-camera" size={36} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setType(type => (type === "back" ? "front" : "back"))}
        style={[
          tailwind(
            "absolute rounded-full w-12 h-12 items-center justify-center"
          ),
          {
            top: 3,
            right: 3,
          },
        ]}
      >
        <Ionicons name="md-reverse-camera" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
