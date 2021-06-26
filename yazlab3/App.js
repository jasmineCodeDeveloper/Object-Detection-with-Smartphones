import Kamera from "./Kamera";
import React, { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Modal, SafeAreaView, Text } from "react-native";
import tailwind from "tailwind-rn";
import AnaButon from "./AnaButon";
import ResimOnay from "./ResimOnay";
import useImagePicker from "./useImagePicker";
import { LogBox } from "react-native";
import { detectObjects } from "./detectObjects";
// Zoomlanabilir resim gösteren component
import ImageViewer from "react-native-image-zoom-viewer";
import Yukleniyor from "./Yukleniyor";

export default function App() {
  // active mod: galllery, camera ya da ""
  const [active, setActive] = useState("");
  // seçilen resmin bilgileri
  const [picture, setPicture] = useState(null);
  // buluttan dönen resmin bilgileri
  const [pictureDone, setPictureDone] = useState(null);
  // resim bulutta işlenirken yükleniyor durumu true olacak
  const [loading, setLoading] = useState(false);
  // pickImage fonksiyonu resim seçmek için diyalog açacak
  const pickImage = useImagePicker({
    // resim seçilirse picture durumunu ayarla
    onImageReady: setPicture,
    // resim seçilmezse active durumunu sıfırla
    onError: () => setActive(""),
  });

  // gereksiz bir uyarı logunu iptal et
  useEffect(() => LogBox.ignoreLogs(["Setting a timer"]), []);

  // sıfırlama fonksiyonu
  const reset = () => {
    // işlenmiş resim diyaloğu varsa kapat
    if (pictureDone) setPictureDone(null);
    // galeri veya kamera aftif ise kapat
    if (active) setActive("");
    // yükleniyor ise iptal et
    if (loading) setLoading(false);
  };

  // android için geri tuşuna sıfırla
  BackHandler.addEventListener("hardwareBackPress", reset);

  // kamera ve galeri kutularını seçilince büyütüp küçülten animasyon değerleri
  const cameraFlex = useRef(new Animated.Value(3));
  const galleryFlex = useRef(new Animated.subtract(6, cameraFlex.current));

  // active durumu değişince animasyon başlat
  useEffect(() => {
    let value = 3;
    if (active === "camera") value = 5;
    else if (active === "gallery") value = 1;

    Animated.timing(cameraFlex.current, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [active]);

  //active durumu değişince seçilen resmi sıfırla
  useEffect(() => setPicture(null), [active]);

  // gönder tuşuna basınca yapılacaklar
  const send = async () => {
    try {
      // loadingi true yap
      setLoading(true);
      // nesneleri bul
      const { infoText, url, error } = await detectObjects(picture);
      // hata varsa bildir
      if (error) throw Error(error);
      // işlenmiş resim durumunu ayarla ve bulunanlar bilgisini bildir
      setPictureDone({ ...picture, uri: url });
      alert(infoText);
      setActive("");
      setLoading(false);
    } catch (error) {
      alert(error);
      setActive("");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={tailwind("flex-1 items-center justify-center py-10 px-6")}
    >
      <Animated.View
        style={[
          tailwind("w-full bg-blue-500 rounded-lg mb-2"),
          { flex: cameraFlex.current },
        ]}
      >
        {active === "camera" ? (
          picture ? (
            <ResimOnay
              source={picture}
              overlay={!picture.done}
              onAccept={send}
              onCancel={() => setActive("")}
            />
          ) : (
            <Kamera onPictureReady={setPicture} />
          )
        ) : (
          <AnaButon onPress={() => setActive("camera")}>Kamera</AnaButon>
        )}
      </Animated.View>

      <Animated.View
        style={[
          tailwind("w-full bg-red-500 rounded-lg mb-2"),
          { flex: galleryFlex.current },
        ]}
      >
        {active === "gallery" && picture ? (
          <ResimOnay
            source={picture}
            overlay={!picture.done}
            onAccept={send}
            onCancel={() => setActive("")}
          />
        ) : (
          <AnaButon
            onPress={() => {
              setActive("gallery");
              pickImage();
            }}
          >
            Galeri
          </AnaButon>
        )}
      </Animated.View>
      {pictureDone && (
        <Modal visible={true} transparent={true} onRequestClose={reset}>
          <ImageViewer
            imageUrls={[{ url: pictureDone.uri, ...pictureDone }]}
            enableSwipeDown={true}
            menuContext={{}}
            onCancel={reset}
          />
        </Modal>
      )}
      {loading && (
        <Modal
          visible={true}
          transparent={true}
          style={{ backgroundColor: "black" }}
        >
          <Yukleniyor />
        </Modal>
      )}
    </SafeAreaView>
  );
}
