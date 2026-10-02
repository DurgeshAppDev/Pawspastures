import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../src/theme";
import { resetPassword } from "../../src/services/AuthServices";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(trimmedEmail);

      Alert.alert(
        "Check your email",
        "If an account exists with this email address, Firebase has sent a password reset link.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      let message =
        "Unable to send the password reset email. Please try again.";

      switch (error?.code) {
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/user-not-found":
          message =
            "If an account exists with this email address, a password reset email will be sent.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many password reset attempts. Please wait and try again later.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection and try again.";
          break;

        default:
          break;
      }

      Alert.alert("Password reset", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full self-center px-6 py-10 max-w-[560px]">
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={loading}
            className="mb-8 h-11 w-11 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={23} color={colors.text} />
          </Pressable>

          <View className="mb-8">
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
              Forgot your password?
            </Text>

            <Text
              className="mt-3 text-base leading-6"
              style={{ color: colors.secondary }}
            >
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </Text>
          </View>

          <View>
            <Text
              className="mb-2 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              Email address
            </Text>

            <View
              className="flex-row items-center rounded-2xl px-4"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 56,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={21}
                color={colors.iconMuted}
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
                className="ml-3 flex-1 text-base"
                style={{
                  color: colors.text,
                  minHeight: 54,
                }}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>
          </View>

          <Pressable
            onPress={handleResetPassword}
            disabled={loading}
            className="mt-6 h-14 items-center justify-center rounded-2xl"
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              opacity: loading ? 0.6 : pressed ? 0.85 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Send Reset Link
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            disabled={loading}
            className="mt-5 items-center py-3"
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              Back to Sign In
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
