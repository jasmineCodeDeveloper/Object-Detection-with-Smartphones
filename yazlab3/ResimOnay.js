import React from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import tailwind from "tailwind-rn";
import { Ionicons } from "@expo/vector-icons";

export default function ResimOnay({
  picture,
  onCancel,
  overlay,
  onAccept,
  ...props
}) {
  return (
    <ImageBackground
      source={picture}
      style={{ flex: 1, flexDirection: "row" }}
      imageStyle={[tailwind("rounded-lg"), { resizeMode: "cover" }]}
      {...props}
    >
      {overlay && (
        <View
          style={tailwind(
            "bg-black bg-opacity-75 w-full self-end mb-10 flex-row justify-evenly items-center"
          )}
        >
          <TouchableOpacity
            onPress={onCancel}
            style={tailwind("w-20 h-20 items-center justify-center")}
          >
            <Ionicons name="md-close" size={48} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={tailwind("w-20 h-20 items-center justify-center")}
          >
            <Ionicons name="md-send" size={48} color="lightblue" />
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
}
