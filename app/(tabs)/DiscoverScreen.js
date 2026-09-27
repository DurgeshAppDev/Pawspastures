import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DiscoverHeader from "../../src/components/discover/DiscoverHeader";
import DiscoverFilters from "../../src/components/discover/DiscoverFilters";
import DiscoverCard from "../../src/components/discover/DiscoverCard";
import DiscoverActions from "../../src/components/discover/DiscoverActions";
import DiscoverAgeGate from "../../src/components/discover/DiscoverAgeGate";

import { colors } from "../../src/theme";

const DISCOVER_PROFILES = [
  {
    id: "1",
    name: "Aarav",
    age: 23,
    location: "Ludhiana",
    distance: "3 km away",
    petName: "Bruno",
    petType: "Golden Retriever",
    compatibility: 92,
    bio: "Dog lover, weekend explorer and always looking for new places to walk with Bruno.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    petImage:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    interests: ["Dogs", "Travel", "Photography"],
  },
  {
    id: "2",
    name: "Mehak",
    age: 22,
    location: "Chandigarh",
    distance: "8 km away",
    petName: "Milo",
    petType: "Labrador",
    compatibility: 88,
    bio: "Coffee, pets and long evening walks. Milo is basically my whole personality.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    petImage:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80",
    interests: ["Pets", "Coffee", "Fitness"],
  },
  {
    id: "3",
    name: "Kabir",
    age: 25,
    location: "Jalandhar",
    distance: "12 km away",
    petName: "Leo",
    petType: "Beagle",
    compatibility: 84,
    bio: "Tech professional who spends most evenings outside with Leo.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    petImage:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80",
    interests: ["Technology", "Dogs", "Movies"],
  },
];

const FILTERS = [
  { id: "dating", label: "Dating" },
  { id: "friends", label: "Friends" },
  { id: "playmates", label: "Pet Playmates" },
];

export default function DiscoverScreen({ route }) {
  const { width } = useWindowDimensions();

  /*
   * IMPORTANT:
   *
   * Replace this with the age coming from your existing authenticated
   * user/profile source.
   *
   * We intentionally do NOT invent a Firebase field name because your
   * current profile schema was not provided.
   *
   * Example:
   * const userAge = currentUserProfile?.age;
   */
  const userAge = route?.params?.userAge;

  const [activeFilter, setActiveFilter] = useState("dating");
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = useMemo(
    () => DISCOVER_PROFILES[currentIndex] ?? null,
    [currentIndex],
  );

  const isAgeKnown = Number.isFinite(Number(userAge));
  const isEligible = isAgeKnown && Number(userAge) >= 18;

  const handleNextProfile = () => {
    if (currentIndex < DISCOVER_PROFILES.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      return;
    }

    Alert.alert(
      "You're all caught up",
      "There are no more profiles available right now.",
    );
  };

  const handlePass = () => {
    handleNextProfile();
  };

  const handleLike = () => {
    handleNextProfile();
  };

  /*
   * Default-deny behavior:
   * If the user's age has not been loaded yet, Discover remains unavailable
   * instead of accidentally exposing adult functionality.
   *
   * Once your profile age is connected, users 18+ automatically enter Discover.
   */
  if (!isEligible) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />

        <DiscoverAgeGate ageKnown={isAgeKnown} />
      </SafeAreaView>
    );
  }

  const isWideWeb = Platform.OS === "web" && width >= 900;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === "web" ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="w-full"
          style={
            isWideWeb
              ? {
                  maxWidth: 1100,
                  alignSelf: "center",
                  width: "100%",
                }
              : undefined
          }
        >
          <DiscoverHeader />

          <DiscoverFilters
            filters={FILTERS}
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentIndex(0);
            }}
          />

          {currentProfile ? (
            <View
              className="w-full px-4"
              style={
                isWideWeb
                  ? {
                      maxWidth: 620,
                      alignSelf: "center",
                    }
                  : undefined
              }
            >
              <DiscoverCard profile={currentProfile} />

              <DiscoverActions onPass={handlePass} onLike={handleLike} />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center px-6 py-16">
              <DiscoverAgeGate ageKnown />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
