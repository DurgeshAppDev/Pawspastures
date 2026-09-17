import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../src/theme";

export default function AddStoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [selectedPet, setSelectedPet] = useState("Bruno");
  const [caption, setCaption] = useState("");

  const pets = [
    {
      id: "1",
      name: "Bruno",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    },
    {
      id: "2",
      name: "Luna",
      image:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400",
    },
  ];

  const handleCreateStory = () => {
    Alert.alert(
      "Story Ready",
      "Your story will be posted here once Firebase is connected."
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      {/* HEADER */}
      <View className="flex-row items-center justify-between border-b border-border px-4 pb-4 pt-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.white}
          />
        </Pressable>

        <Text className="text-[19px] font-extrabold text-white">
          Create Story
        </Text>

        <View className="h-11 w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30 + insets.bottom,
        }}
      >
        {/* STORY PREVIEW */}
        <View className="px-4 pt-5">
          <Text className="mb-3 text-[15px] font-bold text-white">
            Story Preview
          </Text>

          <View className="h-[390px] overflow-hidden rounded-[24px] bg-surface">
            <Image
              source={{
                uri: pets.find(
                  (pet) => pet.name === selectedPet
                )?.image,
              }}
              className="h-full w-full"
              resizeMode="cover"
            />

            {/* DARK OVERLAY */}
            <View className="absolute inset-0 bg-black/20" />

            {/* PET INFORMATION */}
            <View
              className="absolute left-4 right-4 top-4 flex-row items-center"
            >
              <View className="h-11 w-11 overflow-hidden rounded-full border-2 border-primary">
                <Image
                  source={{
                    uri: pets.find(
                      (pet) => pet.name === selectedPet
                    )?.image,
                  }}
                  className="h-full w-full"
                />
              </View>

              <View className="ml-3">
                <Text className="text-[14px] font-bold text-white">
                  {selectedPet}
                </Text>
              </View>
            </View>

            {/* CAPTION PREVIEW */}
            {caption.length > 0 && (
              <View className="absolute bottom-7 left-4 right-4">
                <View className="self-start rounded-2xl bg-black/45 px-4 py-3">
                  <Text className="text-[15px] font-semibold text-white">
                    {caption}
                  </Text>
                </View>
              </View>
            )}

            {/* PET PAW DECORATION */}
            <View className="absolute bottom-5 right-5 h-11 w-11 items-center justify-center rounded-full bg-primary">
              <Ionicons
                name="paw"
                size={22}
                color={colors.background}
              />
            </View>
          </View>
        </View>

        {/* CHOOSE PET */}
        <View className="px-4 pt-7">
          <Text className="mb-3 text-[15px] font-bold text-white">
            Post as
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {pets.map((pet) => {
              const selected = selectedPet === pet.name;

              return (
                <Pressable
                  key={pet.id}
                  onPress={() => setSelectedPet(pet.name)}
                  className={`mr-3 items-center rounded-2xl border px-3 py-3 ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface"
                  }`}
                >
                  <View
                    className={`h-14 w-14 overflow-hidden rounded-full ${
                      selected
                        ? "border-2 border-primary"
                        : "border border-border"
                    }`}
                  >
                    <Image
                      source={{ uri: pet.image }}
                      className="h-full w-full"
                    />
                  </View>

                  <Text
                    className={`mt-2 text-[12px] font-bold ${
                      selected
                        ? "text-primary"
                        : "text-white"
                    }`}
                  >
                    {pet.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* MEDIA OPTIONS */}
        <View className="px-4 pt-7">
          <Text className="mb-3 text-[15px] font-bold text-white">
            Add to your story
          </Text>

          <View className="flex-row">
            <Pressable
              className="mr-3 flex-1 rounded-2xl bg-surface p-4 active:opacity-70"
              onPress={() =>
                Alert.alert(
                  "Camera",
                  "Camera will be connected next."
                )
              }
            >
              <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-elevated">
                <Ionicons
                  name="camera"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <Text className="text-[14px] font-bold text-white">
                Camera
              </Text>

              <Text className="mt-1 text-[11px] text-secondary">
                Take a new photo
              </Text>
            </Pressable>

            <Pressable
              className="flex-1 rounded-2xl bg-surface p-4 active:opacity-70"
              onPress={() =>
                Alert.alert(
                  "Gallery",
                  "Gallery picker will be connected next."
                )
              }
            >
              <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-elevated">
                <Ionicons
                  name="images"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <Text className="text-[14px] font-bold text-white">
                Gallery
              </Text>

              <Text className="mt-1 text-[11px] text-secondary">
                Choose a photo
              </Text>
            </Pressable>
          </View>
        </View>

        {/* CAPTION */}
        <View className="px-4 pt-7">
          <Text className="mb-3 text-[15px] font-bold text-white">
            Add a message
          </Text>

          <View className="rounded-2xl border border-border bg-surface px-4 py-3">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Say something about your pet..."
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={120}
              className="min-h-[80px] text-[14px] text-white"
              textAlignVertical="top"
            />

            <Text className="mt-2 self-end text-[10px] text-secondary">
              {caption.length}/120
            </Text>
          </View>
        </View>

        {/* CREATE STORY */}
        <View
          className="px-4 pt-7"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <Pressable
            onPress={handleCreateStory}
            className="h-[52px] flex-row items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Ionicons
              name="sparkles"
              size={19}
              color={colors.background}
            />

            <Text className="ml-2 text-[15px] font-extrabold text-background">
              Post Story
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}