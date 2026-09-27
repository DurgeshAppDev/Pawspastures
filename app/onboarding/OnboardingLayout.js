import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PetProfileSetupScreen from "./PetProfileSetupScreen";
import AboutYouScreen from "./AboutYouScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingLayout() {
  return (
    <Stack.Navigator
      initialRouteName="PetProfileSetup"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="PetProfileSetup" component={PetProfileSetupScreen} />

      <Stack.Screen name="AboutYou" component={AboutYouScreen} />
    </Stack.Navigator>
  );
}
