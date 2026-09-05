import "./global.css"
import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import AuthLayout from "./app/auth/AuthLayout";

export default function App() {
  return (
    <NavigationContainer>
      <AuthLayout />
    </NavigationContainer>
  );
}