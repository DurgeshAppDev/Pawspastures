import React from "react";

import { Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const TEXT_COLORS = [
  colors.white,
  colors.primary,
  colors.accent,
  colors["text-secondary"],
  colors["icon-muted"],
];

const TEXT_SIZES = [
  {
    label: "S",
    value: 18,
  },
  {
    label: "M",
    value: 24,
  },
  {
    label: "L",
    value: 32,
  },
  {
    label: "XL",
    value: 42,
  },
];

export default function MediaTextToolbar({
  onAddText,

  textColor,
  onTextColorChange,

  textSize,
  onTextSizeChange,

  isBold,
  onBoldChange,

  isItalic,
  onItalicChange,

  isUnderline,
  onUnderlineChange,

  textAlign,
  onTextAlignChange,
}) {
  return (
    <View className="mt-4">
      {/* ----------------------------------------- */}
      {/* TEXT ACTIONS */}
      {/* ----------------------------------------- */}

      <Text className="mb-3 px-1 text-[15px] font-bold text-text-primary">
        Text Editing
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 4,
          gap: 10,
        }}
      >
        {/* Add Text */}

        <Pressable
          onPress={onAddText}
          className="h-[46px] flex-row items-center justify-center rounded-[12px] bg-surface-elevated px-4"
        >
          <Ionicons name="text-outline" size={22} color={colors.primary} />

          <Text className="ml-2 text-[14px] font-bold text-text-primary">
            Text
          </Text>
        </Pressable>

        {/* Bold */}

        <Pressable
          onPress={() => onBoldChange(!isBold)}
          className={`h-[46px] w-[46px] items-center justify-center rounded-[12px] ${
            isBold ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 19,
              fontWeight: "900",
            }}
          >
            B
          </Text>
        </Pressable>

        {/* Italic */}

        <Pressable
          onPress={() => onItalicChange(!isItalic)}
          className={`h-[46px] w-[46px] items-center justify-center rounded-[12px] ${
            isItalic ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 19,
              fontWeight: "700",
              fontStyle: "italic",
            }}
          >
            I
          </Text>
        </Pressable>

        {/* Underline */}

        <Pressable
          onPress={() => onUnderlineChange(!isUnderline)}
          className={`h-[46px] w-[46px] items-center justify-center rounded-[12px] ${
            isUnderline ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 19,
              fontWeight: "700",
              textDecorationLine: "underline",
            }}
          >
            U
          </Text>
        </Pressable>

        {/* Left */}

        <Pressable
          onPress={() => onTextAlignChange("left")}
          className={`h-[46px] w-[46px] items-center justify-center rounded-[12px] ${
            textAlign === "left" ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          <Ionicons name="text-outline" size={22} color={colors.white} />
        </Pressable>

        {/* Center */}

        <Pressable
          onPress={() => onTextAlignChange("center")}
          className={`h-[46px] w-[46px] items-center justify-center rounded-[12px] ${
            textAlign === "center" ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          <Ionicons
            name="reorder-three-outline"
            size={25}
            color={colors.white}
          />
        </Pressable>

        {/* Right */}

        <Pressable
          onPress={() => onTextAlignChange("right")}
          className={`h-[46px] w-[46px] items-center justify-center rounded-[12px] ${
            textAlign === "right" ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          <Ionicons
            name="reorder-four-outline"
            size={24}
            color={colors.white}
          />
        </Pressable>
      </ScrollView>

      {/* ----------------------------------------- */}
      {/* COLORS */}
      {/* ----------------------------------------- */}

      <View className="mt-5">
        <Text className="mb-3 text-[14px] font-semibold text-text-secondary">
          Text Color
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 14,
          }}
        >
          {TEXT_COLORS.map((color, index) => {
            const selected = textColor === color;

            return (
              <Pressable
                key={`${color}-${index}`}
                onPress={() => onTextColorChange(color)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: color,
                  borderWidth: selected ? 3 : 1,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* ----------------------------------------- */}
      {/* SIZE */}
      {/* ----------------------------------------- */}

      <View className="mt-5">
        <Text className="mb-3 text-[14px] font-semibold text-text-secondary">
          Text Size
        </Text>

        <View className="flex-row gap-3">
          {TEXT_SIZES.map((item) => {
            const selected = textSize === item.value;

            return (
              <Pressable
                key={item.label}
                onPress={() => onTextSizeChange(item.value)}
                className={`h-[42px] min-w-[58px] items-center justify-center rounded-[11px] ${
                  selected ? "bg-primary" : "bg-surface-elevated"
                }`}
              >
                <Text className="text-[14px] font-bold text-white">
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
