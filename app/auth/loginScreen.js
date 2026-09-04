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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login
  const handleLogin = () => {
    if (!email.trim()) {
      console.log("Please enter your email");
      return;
    }

    if (!password.trim()) {
      console.log("Please enter your password");
      return;
    }

    // Firebase login will be added here
    console.log("Login:", email, password);
  };

  // Google Login
  const handleGoogleLogin = () => {
    // Google authentication will be added here
    console.log("Google Login");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
    
        {/* ================= MAIN CONTENT ================= */}

        <View className="w-full max-w-[560px] self-center px-5 pt-[150px] pb-[50px]">
          
          {/* Paw Icon */}

          <View className="w-[52px] h-[52px] rounded-full bg-[#251A16] items-center justify-center self-center mb-[18px]">
            <Ionicons
              name="paw"
              size={32}
              color="#FE5B00"
            />
          </View>

          {/* Title */}

          <Text className="text-text-primary text-[34px] font-bold text-center">
            Welcome back
          </Text>

          {/* Subtitle */}

          <Text className="text-[#D2AAA0] text-sm text-center mt-[7px] mb-[27px]">
            Please enter your details to sign in
          </Text>

          {/* ================= EMAIL ================= */}

          <View className="mb-[19px]">
            <Text className="text-text-primary text-xs font-medium mb-[7px]">
              Email address
            </Text>

            <View className="h-[52px] bg-surface rounded-[10px] flex-row items-center px-3">
              
              <Ionicons
                name="mail-outline"
                size={21}
                color="#D7BDB2"
                style={{ marginRight: 9 }}
              />

              <TextInput
                className="flex-1 h-full text-white text-sm"
                value={email}
                onChangeText={setEmail}
                placeholder="hello@example.com"
                placeholderTextColor="#7E7775"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                accessibilityLabel="Email address"
              />
            </View>
          </View>

          {/* ================= PASSWORD ================= */}

          <View className="mb-[19px]">
            
            <View className="flex-row justify-between items-center">
              
              <Text className="text-text-primary text-xs font-medium mb-[7px]">
                Password
              </Text>

              <Pressable
                onPress={() =>
                  navigation?.navigate("ForgotPassword")
                }
                accessibilityRole="button"
              >
                <Text className="text-[#FFB09A] text-[11px] font-semibold">
                  Forgot Password?
                </Text>
              </Pressable>

            </View>

            <View className="h-[52px] bg-surface rounded-[10px] flex-row items-center px-3">
              
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#D7BDB2"
                style={{ marginRight: 9 }}
              />

              <TextInput
                className="flex-1 h-full text-white text-sm"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#7E7775"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                accessibilityLabel="Password"
              />

              {/* Show / Hide Password */}

              <Pressable
                onPress={() =>
                  setShowPassword((previous) => !previous)
                }
                className="p-[6px]"
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
                  size={21}
                  color="#D7BDB2"
                />
              </Pressable>

            </View>
          </View>

          {/* ================= SIGN IN ================= */}

          <Pressable
            onPress={handleLogin}
            className="h-[50px] rounded-[10px] bg-primary flex-row items-center justify-center mt-[10px] gap-[7px] active:opacity-80"
            accessibilityRole="button"
          >
            <Text className="text-white text-[13px] font-bold">
              Sign In
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          {/* ================= DIVIDER ================= */}

          <View className="flex-row items-center my-[28px]">
            
            <View className="flex-1 h-px bg-border" />

            <Text className="text-[#BFA8A1] text-[9px] font-semibold mx-3">
              OR CONTINUE WITH
            </Text>

            <View className="flex-1 h-px bg-border" />

          </View>

          {/* ================= GOOGLE ================= */}

          <Pressable
            onPress={handleGoogleLogin}
            className="h-[44px] rounded-[9px] bg-surface-elevated flex-row items-center justify-center gap-[9px] active:opacity-80"
            accessibilityRole="button"
          >
            <Text className="text-[18px] font-bold text-[#4285F4]">
              G
            </Text>

            <Text className="text-[#D6DEE6] text-[13px] font-medium">
              Google
            </Text>
          </Pressable>

          {/* ================= REGISTER ================= */}

          <View className="flex-row justify-center items-center mt-[27px]">
            
            <Text className="text-[#BFA9A2] text-xs">
              Don't have an account?{" "}
            </Text>

            <Pressable
              onPress={() =>
                navigation?.navigate("Register")
              }
              accessibilityRole="button"
            >
              <Text className="text-[#FFB09A] text-xs font-bold">
                Create one
              </Text>
            </Pressable>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

