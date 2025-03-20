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
import { useDispatch, useSelector } from "react-redux"
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { changePassword } from "../../store/auth/authSlice"
import type { AppDispatch, RootState } from "../../store"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../types/navigation"
import { passwordChangeCompleted } from "../../store/auth/authSlice"

type ChangePasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ChangePassword">
  route: {
    params: {
      email: string
    }
  }
}

export default function ChangePasswordScreen({ navigation, route }: ChangePasswordScreenProps) {
  const { email } = route.params
  const { token } = useSelector((state: RootState) => state.auth)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Harap isi semua field")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Password baru tidak cocok dengan konfirmasi password")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password baru harus minimal 8 karakter")
      return
    }

    setLoading(true)
    try {
      // Get the token from AsyncStorage if not available in state
      const userToken = token || (await AsyncStorage.getItem("userToken"))

      if (!userToken) {
        throw new Error("Token tidak ditemukan. Silahkan login kembali.")
      }

      // Call the change password API through Redux
      const result = await dispatch(
        changePassword({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      ).unwrap()

      // If a new token is returned, update it in AsyncStorage
      if (result.token) {
        await AsyncStorage.setItem("userToken", result.token)
        console.log("Password changed successfully, new token saved")
      }

      // Mark that the user no longer needs to change their password
      dispatch(passwordChangeCompleted())

      Alert.alert("Sukses", "Password berhasil diubah.", [
        {
          text: "OK",
          onPress: () => {
            // The RootNavigator will handle navigation to onboarding or main app
            // based on whether the user needs onboarding
          },
        },
      ])
    } catch (error) {
      console.error("Change password error:", error)
      Alert.alert("Gagal", error instanceof Error ? error.message : "Gagal mengubah password. Silahkan coba lagi.")
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
            <Text className="text-2xl font-bold text-gray-800">Buat Password Baru</Text>
            <Text className="text-gray-500 text-center mt-2">
              Silahkan masukkan password yang diberikan sistem dan buat password baru untuk akun {email}
            </Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <KeyRound size={20} color="#6b7280" />
              </View>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                placeholder="Password Saat Ini"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3 z-10"
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>

            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#6b7280" />
              </View>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                placeholder="Password Baru"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3 z-10"
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>

            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#6b7280" />
              </View>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showNewPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            className={`bg-blue-500 py-3 rounded-lg items-center ${loading ? "opacity-70" : ""}`}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-2">Menyimpan...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Simpan Password Baru</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

