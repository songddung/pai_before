import React from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({
  children,
  onPress,
  disabled,
  variant = "default",
  size = "md",
  className,
}: ButtonProps) {
  let baseStyle =
    "rounded-lg items-center justify-center font-medium " +
    (size === "sm" ? "px-3 py-1 text-sm" : size === "lg" ? "px-6 py-3 text-lg" : "px-4 py-2");

  let variantStyle = "";
  if (variant === "default") {
    variantStyle = disabled
      ? "bg-gray-300 text-gray-500"
      : "bg-blue-500 text-white";
  } else if (variant === "outline") {
    variantStyle = "border border-gray-300 text-gray-700 bg-white";
  } else if (variant === "ghost") {
    variantStyle = "bg-transparent text-gray-600";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
