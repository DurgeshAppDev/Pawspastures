import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";
import { Images } from "../../src/constants";
import {
  loginUser,
  loginWithGoogle,
  loginWithApple,
} from "../services/AuthServices";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // ================= LOGIN =================

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Please enter your email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const user = await loginUser(email, password);

      // navigation?.replace("HomeScreen")
    } catch (error) {
      console.log("Login error:", error.code);

      if (error.code === "auth/invalid-credential") {
        Alert.alert("Login failed", "Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Login failed", "Please enter a valid email.");
      } else {
        Alert.alert("Login failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================

  const handleGoogleLogin = async () => {
    // Native Google Sign-In does not work on Web
    if (Platform.OS === "web") {
      Alert.alert(
        "Google Login",
        "Google login is currently available on Android and iOS.",
      );
      return;
    }

    try {
      setGoogleLoading(true);

      const user = await loginWithGoogle();

      console.log("Google user:", user.uid);

    } catch (error) {
      console.log("Google login error:", error);

      if (error.code === "auth/cancelled-popup-request") {
        return;
      }

      Alert.alert(
        "Google Login failed",
        error.message || "Unable to sign in with Google.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };
  // ================= APPLE LOGIN =================

  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);

      const user = await loginWithApple();

      console.log("Apple user:", user.uid);

    } catch (error) {
      console.log("Apple login error:", error);

      if (error.code === "auth/cancelled-popup-request") {
        return;
      }

      Alert.alert(
        "Apple Login failed",
        error.message || "Unable to sign in with Apple.",
      );
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================= MAIN CONTENT ================= */}

        <View className="w-full max-w-[560px] self-center px-6 py-10">
          {/* ================= PAW ICON ================= */}
          <View className="w-[64px] h-[64px] rounded-full bg-surface-icon items-center justify-center self-center mb-5">
            <Ionicons name="paw" size={38} color={colors.primary} />
          </View>
          {/* ================= TITLE ================= */}
          <Text className="text-text-primary text-[38px] font-bold text-center">
            Welcome back
          </Text>
          {/* ================= SUBTITLE ================= */}
          <Text className="text-text-muted text-[16px] text-center mt-2 mb-9">
            Please enter your details to sign in
          </Text>
          {/* ================= EMAIL ================= */}
          <View className="mb-6">
            <Text className="text-text-primary text-[14px] font-medium mb-2">
              Email address
            </Text>

            <View className="h-[58px] bg-surface rounded-[12px] flex-row items-center px-4">
              <Ionicons
                name="mail-outline"
                size={23}
                color={colors["icon-muted"]}
                style={{ marginRight: 11 }}
              />

              <TextInput
                className="flex-1 h-full text-text-primary text-[16px]"
                value={email}
                onChangeText={setEmail}
                placeholder="hello@example.com"
                placeholderTextColor={colors["text-placeholder"]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                accessibilityLabel="Email address"
              />
            </View>
          </View>
          {/* ================= PASSWORD ================= */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-primary text-[14px] font-medium">
                Password
              </Text>

              <Pressable
                onPress={() => navigation.navigate("ForgotPassword")}
                accessibilityRole="button"
              >
                <Text className="text-accent text-[13px] font-semibold">
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            <View className="h-[58px] bg-surface rounded-[12px] flex-row items-center px-4">
              <Ionicons
                name="lock-closed-outline"
                size={23}
                color={colors["icon-muted"]}
                style={{ marginRight: 11 }}
              />

              <TextInput
                className="flex-1 h-full text-text-primary text-[16px]"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors["text-placeholder"]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                accessibilityLabel="Password"
              />

              {/* Show / Hide Password */}

              <Pressable
                onPress={() => setShowPassword((previous) => !previous)}
                className="p-2"
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={23}
                  color={colors["icon-muted"]}
                />
              </Pressable>
            </View>
          </View>
          {/* ================= SIGN IN ================= */}
          <Pressable
            onPress={handleLogin}
            className="h-[56px] rounded-[12px] bg-primary flex-row items-center justify-center mt-2 gap-2 active:opacity-80"
            accessibilityRole="button"
          >
            <Text className="text-white text-[16px] font-bold">Sign In</Text>

            <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
          </Pressable>
          {/* ================= DIVIDER ================= */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-border" />

            <Text className="text-[#BFA8A1] text-[11px] font-semibold mx-4">
              OR CONTINUE WITH
            </Text>

            <View className="flex-1 h-px bg-border" />
          </View>
          {/* ================= GOOGLE ================= */}
          {Platform.OS !== "web" && (
            <Pressable
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              className="h-[54px] rounded-[12px] bg-surface-elevated flex-row items-center justify-center gap-3 active:opacity-80"
              accessibilityRole="button"
            >
              <Image
                source={Images.googleLogo}
                className="w-6 h-6"
                resizeMode="contain"
              />

              <Text className="text-[#D6DEE6] text-[16px] font-medium">
                {googleLoading ? "Signing in..." : "Continue with Google"}
              </Text>
            </Pressable>
          )}
          {/* apple login */}
          {Platform.OS === "ios" && (
            <Pressable
              onPress={handleAppleLogin}
              disabled={appleLoading}
              className="h-[54px] rounded-[12px] bg-black flex-row items-center justify-center gap-3 mt-3 active:opacity-80"
              accessibilityRole="button"
            >
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />

              <Text className="text-white text-[16px] font-medium">
                {appleLoading ? "Signing in..." : "Continue with Apple"}
              </Text>
            </Pressable>
          )}
          {/* ================= REGISTER ================= */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-[#BFA9A2] text-[14px]">
              Don't have an account?{" "}
            </Text>

            <Pressable
              onPress={() => navigation?.navigate("RegisterScreen")}
              accessibilityRole="button"
            >
              <Text className="text-[#FFB09A] text-[14px] font-bold">
                Create one
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
