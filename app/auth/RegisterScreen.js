import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ================= REGISTER =================

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const user = await registerUser(email, password);

      console.log("Registered user:", user.uid);

      Alert.alert(
        "Registration successful",
        "Your account has been created."
      );

      // navigation.replace("Home");

    } catch (error) {
      console.log("Registration error:", error.code);

      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Registration failed",
          "An account already exists with this email."
        );
      } else if (error.code === "auth/invalid-email") {
        Alert.alert(
          "Registration failed",
          "Please enter a valid email."
        );
      } else if (error.code === "auth/weak-password") {
        Alert.alert(
          "Registration failed",
          "Password is too weak."
        );
      } else {
        Alert.alert(
          "Registration failed",
          error.message
        );
      }
    } finally {
      setLoading(false);
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
            <Ionicons
              name="paw"
              size={38}
              color={colors.primary}
            />
          </View>

          {/* ================= TITLE ================= */}

          <Text className="text-text-primary text-[38px] font-bold text-center">
            Create account
          </Text>

          {/* ================= SUBTITLE ================= */}

          <Text className="text-text-muted text-[16px] text-center mt-2 mb-9">
            Join Paws & Pastures today
          </Text>

          {/* ================= NAME ================= */}

          <View className="mb-6">

            <Text className="text-text-primary text-[14px] font-medium mb-2">
              Full name
            </Text>

            <View className="h-[58px] bg-surface rounded-[12px] flex-row items-center px-4">

              <Ionicons
                name="person-outline"
                size={23}
                color={colors["icon-muted"]}
                style={{ marginRight: 11 }}
              />

              <TextInput
                className="flex-1 h-full text-text-primary text-[16px]"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors["text-placeholder"]}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                accessibilityLabel="Full name"
              />

            </View>
          </View>

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

            <Text className="text-text-primary text-[14px] font-medium mb-2">
              Password
            </Text>

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
                placeholder="Create a password"
                placeholderTextColor={colors["text-placeholder"]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                accessibilityLabel="Password"
              />

              <Pressable
                onPress={() =>
                  setShowPassword((previous) => !previous)
                }
                className="p-2"
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={23}
                  color={colors["icon-muted"]}
                />
              </Pressable>

            </View>
          </View>

          {/* ================= CONFIRM PASSWORD ================= */}

          <View className="mb-6">

            <Text className="text-text-primary text-[14px] font-medium mb-2">
              Confirm password
            </Text>

            <View className="h-[58px] bg-surface rounded-[12px] flex-row items-center px-4">

              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color={colors["icon-muted"]}
                style={{ marginRight: 11 }}
              />

              <TextInput
                className="flex-1 h-full text-text-primary text-[16px]"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={colors["text-placeholder"]}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                accessibilityLabel="Confirm password"
              />

              <Pressable
                onPress={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                className="p-2"
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={23}
                  color={colors["icon-muted"]}
                />
              </Pressable>

            </View>
          </View>

          {/* ================= CREATE ACCOUNT ================= */}

          <Pressable
            onPress={handleRegister}
            className="h-[56px] rounded-[12px] bg-primary flex-row items-center justify-center mt-2 gap-2 active:opacity-80"
            accessibilityRole="button"
          >

            <Text className="text-white text-[16px] font-bold">
              Create Account
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
              color="#FFFFFF"
            />

          </Pressable>

          {/* ================= LOGIN ================= */}

          <View className="flex-row justify-center items-center mt-8">

            <Text className="text-[#BFA9A2] text-[14px]">
              Already have an account?{" "}
            </Text>

            <Pressable
              onPress={() =>
                navigation?.navigate("LoginScreen")
              }
              accessibilityRole="button"
            >
              <Text className="text-[#FFB09A] text-[14px] font-bold">
                Sign in
              </Text>
            </Pressable>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
