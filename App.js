import "./global.css"
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "./src/config/firebase";

export default function App() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "users"), {
        name: name.trim(),
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Name saved to Firebase!");
      setName("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-3xl font-bold text-gray-900">
        Paws & Pastures 🐾
      </Text>

      <Text className="mb-8 text-gray-500">
        Firestore Test
      </Text>

      <TextInput
        className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-4"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Pressable
        onPress={saveName}
        disabled={loading}
        className="w-full rounded-xl bg-black py-4"
      >
        <Text className="text-center font-bold text-white">
          {loading ? "Saving..." : "Save Name"}
        </Text>
      </Pressable>
    </View>
  );
}