import React from "react";
import { Text, TouchableOpacity } from "react-native";
import tailwind from "tailwind-rn";

export default function AnaButon({ children, ...props }) {
  return (
    <TouchableOpacity
      {...props}
      style={tailwind("flex-1 w-full items-center justify-center")}
    >
      <Text style={tailwind("text-white font-bold text-5xl")}>{children}</Text>
    </TouchableOpacity>
  );
}
