import { useCallback, useEffect } from "react";
// resim seçme diyaloğunu açmaya yarayan kütüphane
import * as ImagePicker from "expo-image-picker";

export default useImagePicker = ({ onImageReady, onError }) => {
  // hook'un kullanıldığı component gözükünce depolama izni yoksa iste
  useEffect(() => {
    ImagePicker.requestCameraRollPermissionsAsync().then(({ status }) => {
      if (status !== "granted") alert("Depolama erişim izni verilmedi!");
    });
  }, []);

  // resim seçme diyaloğunu açan fonksiyon
  const pickImage = useCallback(async (options = {}) => {
    // diyaloğu göster ve sonucu bekle
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      ...options,
    });
    // sonuç varsa onImageReady propunu yoksa onError propunu çağır
    if (!result.cancelled) onImageReady?.(result);
    else onError?.(true);
  }, []);

  return pickImage;
};
