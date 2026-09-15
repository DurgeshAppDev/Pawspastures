import React, { useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DiscoverHeader from "../../src/components/discover/DiscoverHeader";
import DiscoverFilters from "../../src/components/discover/DiscoverFilters";
import DiscoverCard from "../../src/components/discover/DiscoverCard";
import DiscoverActions from "../../src/components/discover/DiscoverActions";

import { colors } from "../../src/theme";

const DISCOVER_PROFILES = [
  {
    id: "1",
    name: "Alice",
    age: 21,
    compatibility: 87,
    verified: true,
    petName: "Bruno",
    petBreed: "Golden Retriever",
    distance: "3 km",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "2",
    name: "Riya",
    age: 23,
    compatibility: 82,
    verified: true,
    petName: "Max",
    petBreed: "Labrador",
    distance: "5 km",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
  },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState("dating");
  const [currentIndex, setCurrentIndex] = useState(0);

  const profile = DISCOVER_PROFILES[currentIndex];

  const handlePass = () => {
    if (currentIndex < DISCOVER_PROFILES.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    Alert.alert(
      "You're all caught up",
      "There are no more profiles to show right now."
    );
  };

  const handleLike = () => {
    if (currentIndex < DISCOVER_PROFILES.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    Alert.alert(
      "You're all caught up",
      "There are no more profiles to show right now."
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-5"
      >
        {/* Header */}
        <DiscoverHeader
          onSearchPress={() => {
            console.log("Search pressed");
          }}
        />

        {/* Filters */}
        <DiscoverFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onAdvancedFilterPress={() => {
            console.log("Advanced filters pressed");
          }}
        />

        {/* Profile Card */}
        {profile && (
          <DiscoverCard
            profile={profile}
            onProfilePress={(selectedProfile) => {
              console.log(
                "Profile pressed:",
                selectedProfile.name
              );
            }}
          />
        )}

        {/* Actions */}
        {profile && (
          <DiscoverActions
            onPass={handlePass}
            onLike={handleLike}
          />
        )}
      </ScrollView>
    </View>
  );
}