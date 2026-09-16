import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../src/theme";

export default function NewPostScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [caption, setCaption] = useState("");
  const [selectedPet, setSelectedPet] = useState("Barnaby");
  const [media, setMedia] = useState(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectMedia = () => {
    /*
      Later:
      expo-image-picker can be connected here.
    */

    Alert.alert("Add Media", "Photo/video picker will be connected here.");
  };

  const handleCreatePost = () => {
    if (!media) {
      Alert.alert(
        "Add a photo or video",
        "Please select media before creating your post.",
      );
      return;
    }

    Alert.alert("Post Created", "Your post will be published here.");
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-5 border-b border-border bg-background px-4 py-3">
        <Pressable
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-80"
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={colors["text-primary"]}
          />
        </Pressable>

        <Text className="text-[18px] font-extrabold text-text-primary">
          New Post
        </Text>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-8"
      >
        {/* Media section */}
        <View className="px-4 pt-5">
          <Text className="text-[16px] font-extrabold text-text-primary">
            Add media
          </Text>

          <Pressable
            onPress={handleSelectMedia}
            className="mt-3 h-[300px] w-full items-center justify-center overflow-hidden rounded-[18px] border border-border bg-surface-elevated active:opacity-90"
          >
            {media ? (
              <Image
                source={{ uri: media }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-surface">
                  <Ionicons
                    name="images-outline"
                    size={27}
                    color={colors.primary}
                  />
                </View>

                <Text className="mt-3 text-[15px] font-bold text-text-primary">
                  Add a photo or video
                </Text>

                <Text className="mt-1.5 text-center text-[12px] text-text-secondary">
                  Share a moment with your companions
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Pet selection */}
        <View className="mt-6 px-4">
          <Text className="text-[16px] font-extrabold text-text-primary">
            Post with
          </Text>

          <Pressable
            className="mt-3 flex-row items-center rounded-[14px] border border-border bg-surface px-3.5 py-3 active:opacity-80"
            onPress={() =>
              Alert.alert("Select Pet", "Pet selection will be connected here.")
            }
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-icon">
              <Ionicons name="paw" size={21} color={colors.primary} />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-text-primary">
                {selectedPet}
              </Text>

              <Text className="mt-1 text-[11px] text-text-secondary">
                Your companion
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors["icon-muted"]}
            />
          </Pressable>
        </View>

        {/* Caption */}
        <View className="mt-6 px-4">
          <Text className="text-[16px] font-extrabold text-text-primary">
            Caption
          </Text>

          <View className="mt-3 rounded-[14px] border border-border bg-surface px-3.5 py-3">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Share something about this moment..."
              placeholderTextColor={colors["text-placeholder"]}
              multiline
              textAlignVertical="top"
              maxLength={500}
              className="min-h-[110px] text-[14px] leading-[21px] text-text-primary"
            />

            <Text className="self-end text-[10px] text-text-secondary">
              {caption.length}/500
            </Text>
          </View>
        </View>

        {/* Additional options */}
        <View className="mt-6 px-4">
          <Text className="text-[16px] font-extrabold text-text-primary">
            Options
          </Text>

          <View className="mt-3 overflow-hidden rounded-[14px] border border-border bg-surface">
            {/* Location */}
            <Pressable
              className="flex-row items-center px-3.5 py-3.5 active:opacity-80"
              onPress={() =>
                Alert.alert(
                  "Location",
                  "Location selection will be connected here.",
                )
              }
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <Text className="ml-3 flex-1 text-[13px] font-semibold text-text-primary">
                Add location
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={colors["icon-muted"]}
              />
            </Pressable>

            <View className="ml-3.5 border-t border-border" />

            {/* Comments */}
            <Pressable
              className="flex-row items-center px-3.5 py-3.5 active:opacity-80"
              onPress={() =>
                Alert.alert(
                  "Comments",
                  "Comment settings will be connected here.",
                )
              }
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <Text className="ml-3 flex-1 text-[13px] font-semibold text-text-primary">
                Allow comments
              </Text>

              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Bottom post button */}
        <View
          className="px-4 pt-7"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <Pressable
            onPress={handleCreatePost}
            className="h-[48px] items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Text className="text-[14px] font-extrabold text-background">
              Create Post
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
