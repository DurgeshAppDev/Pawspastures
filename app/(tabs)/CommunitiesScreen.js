import React, { useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import CommunitiesHeader from "../../src/components/communities/CommunitiesHeader";
import RecommendedGroups from "../../src/components/communities/RecommendedGroups";
import MyCommunities from "../../src/components/communities/MyCommunities";
import UpcomingEvents from "../../src/components/communities/UpcomingEvents";

import { colors } from "../../src/theme";

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const handleCreateCommunity = () => {
    Alert.alert(
      "Create Community",
      "Community creation will be connected here."
    );
  };

  const handleSeeAllGroups = () => {
    Alert.alert(
      "Recommended Groups",
      "All recommended communities will appear here."
    );
  };

  const handleJoinGroup = (group) => {
    Alert.alert(
      "Join Group",
      `You selected ${group.name}.`
    );
  };

  const handleCommunityPress = (community) => {
    Alert.alert(
      community.name,
      "Community details will open here."
    );
  };

  const handleSeeSchedule = () => {
    Alert.alert(
      "Event Schedule",
      "The complete event schedule will appear here."
    );
  };

  const handleRsvp = (event) => {
    Alert.alert(
      "RSVP",
      `You selected ${event.title}.`
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
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-5"
      >
        <CommunitiesHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          onCreatePress={handleCreateCommunity}
        />

        <RecommendedGroups
          onSeeAll={handleSeeAllGroups}
          onJoinGroup={handleJoinGroup}
        />

        <MyCommunities
          onCommunityPress={handleCommunityPress}
        />

        <UpcomingEvents
          onSeeSchedule={handleSeeSchedule}
          onRsvp={handleRsvp}
        />
      </ScrollView>
    </View>
  );
}