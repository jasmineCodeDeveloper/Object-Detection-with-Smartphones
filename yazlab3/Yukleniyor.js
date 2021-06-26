import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import tailwind from "tailwind-rn";

export default function Yukleniyor() {
  // Yükleniyor noktaları...
  const [dots, setDots] = useState([]);

  // Component gözükünce 300 saniyede bir nokta eklemeye başla
  useEffect(() => {
    const interval = setInterval(
      () => setDots(dots => Array((dots.length + 1) % 4).fill(".")),
      300
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={tailwind(
        "flex-1 w-full bg-black bg-opacity-75 items-center justify-center"
      )}
    >
      <View
        style={tailwind(
          "bg-gray-300 px-16 py-8 rounded items-center justify-center"
        )}
      >
        <Text style={tailwind("text-2xl font-bold")}>
          Yükleniyor{dots.concat(Array(3 - dots.length).fill(" "))}
        </Text>
      </View>
    </View>
  );
}
