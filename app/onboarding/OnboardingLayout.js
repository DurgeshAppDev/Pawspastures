import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AboutYouScreen from "./AboutYouScreen";
import PetProfileSetupScreen from "./PetProfileSetupScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingLayout({ onComplete }) {
  return (
    <Stack.Navigator
      initialRouteName="AboutYou"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="AboutYou" component={AboutYouScreen} />

      <Stack.Screen name="PetProfileSetup">
        {(props) => (
          <PetProfileSetupScreen {...props} onComplete={onComplete} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
