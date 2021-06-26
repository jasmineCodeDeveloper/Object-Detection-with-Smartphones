import { detect, storage, store } from "./firebase";

// nesneleri tespit etmek için çağırılan fonksiyon
export const detectObjects = async picture => {
  try {
    // seçilen resmi hazırla
    const img = await fetch(picture.uri);
    const imageBlob = await img.blob();
    // resmi bulut depolamaya gönder
    const name =
      "test/" + picture.uri.substring(picture.uri.lastIndexOf("/") + 1);
    await storage.ref().child(name).put(imageBlob);
    // detect bulut fonksiyonunu çağır ve sonucu bekle
    let res = await detect({ name });
    if (!res.ok) return { error: "Bellek limiti aşıldı!" };
    res = await res.json();
    // fonksiyondan dönen info bilgisini anlamlı metine dönüştür
    const info = res.info.reduce((acc, { class: c }) => {
      if (acc[c]) return { ...acc, [c]: acc[c] + 1 };
      else return { ...acc, [c]: 1 };
    }, {});
    let infoText = "Bulunanlar: \n";
    for (const key in info) {
      if (Object.hasOwnProperty.call(info, key)) {
        const count = info[key];
        infoText += `${count} adet ${key}` + "\n";
      }
    }
    if (infoText.length < 16) return { error: "Hiçbir nesne bulunamadı." };
    // bulut fonksiyonun işleyip depoladığı resmin linkini al ve döndür
    const url = await storage.ref().child(res.name).getDownloadURL();
    // sonucu database'e kaydet
    storage
      .ref()
      .child(name)
      .getDownloadURL()
      .then(inUrl => store({ in: inUrl, out: url }));
    return { infoText, url };
  } catch (error) {
    return { error: "Beklenmeyen bir hata oluştu" + error.message };
  }
};
