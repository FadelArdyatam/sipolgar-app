"use client"

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { login, setNeedsOnboarding } from "../../store/auth/authSlice";
import { Eye, EyeOff, User, Lock } from "lucide-react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../types/navigation";
import type { AppDispatch } from "../../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { getUserProfile } from "~/app/services/AuthServices";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Harap isi semua field");
      return;
    }
    
    setLoading(true);
    try {
      const result = await dispatch(login({ username, password })).unwrap();
      
      // Log untuk debug
      console.log("User data after login:", result.user.personel);
      
      // Periksa onboardingCompleted dari AsyncStorage
      const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted");
      console.log("Onboarding completed flag:", onboardingCompleted);
      
      // Periksa apakah user perlu onboarding
      const needsOnboarding = (!result.user.personel?.tinggi_badan || !result.user.personel?.berat_badan) && 
                             onboardingCompleted !== "true";
      
      console.log("Onboarding status:", needsOnboarding);
      console.log(getUserProfile);
      
      if (onboardingCompleted === "true") {
        console.log("Onboarding completed flag exists, going to Main");
        // Jika flag ada, langsung ke Main
        navigation.navigate("Main");
      } else {
        console.log("Onboarding not completed, redirecting to Onboarding");
        // Jika flag tidak ada, arahkan ke Onboarding
        navigation.navigate("Onboarding");
      }

      if (needsOnboarding) {
        console.log("User needs onboarding, redirecting to Onboarding");
        // Reset flag onboarding di AsyncStorage
        await AsyncStorage.removeItem("onboardingCompleted");
        dispatch(setNeedsOnboarding(true));
        
        // Navigasi ke Onboarding
        navigation.navigate("Onboarding");
      } else {
        console.log("User does not need onboarding, redirecting to Main");
        // Pastikan flag disimpan jika belum ada
        if (result.user.personel?.tinggi_badan && result.user.personel?.berat_badan) {
          await AsyncStorage.setItem("onboardingCompleted", "true");
          dispatch(setNeedsOnboarding(false));
        }
        
        // Reset navigasi ke Main untuk mencegah kembali ke login
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Please check your credentials and try again",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 justify-center">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">Selamat Datang</Text>
            <Text className="text-gray-500 text-center mt-2">Masuk ke akun Sipolgar Anda untuk melanjutkan</Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <User size={20} color="#6b7280" />
              </View>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                placeholder="NRP/Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#6b7280" />
              </View>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity className="absolute right-3 top-3 z-10" onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="self-end mb-6" onPress={() => navigation.navigate("ForgotPassword")}>
            <Text className="text-blue-500 font-medium">Lupa Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-blue-500 py-3 rounded-lg items-center ${loading ? "opacity-70" : ""}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-2">Masuk...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Masuk</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-blue-500 font-medium">Daftar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}