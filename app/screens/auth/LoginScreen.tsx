"use client"

import { useState } from "react"
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
} from "react-native"
import { useDispatch } from "react-redux"
import { login } from "../../store/auth/authSlice"
import { Eye, EyeOff, User, Lock } from "lucide-react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../types/navigation"
import type { AppDispatch } from "../../store"
import AsyncStorage from "@react-native-async-storage/async-storage"

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  // Update the login success handler to check for first login
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      console.log("Attempting login with username:", username)
      const result = await dispatch(login({ username, password })).unwrap()
      console.log("Login successful")

      // Check if this is the first login and password needs to be changed
      const passwordChanged = await AsyncStorage.getItem("passwordChanged")
      if (!passwordChanged) {
        // The RootNavigator will handle navigation to the change password screen
        console.log("First login detected, user will be prompted to change password")
      }
      // Otherwise, navigation will be handled by the auth state listener in RootNavigator
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Please check your credentials and try again",
      )
    } finally {
      setLoading(false)
    }
  }

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
  )
}

