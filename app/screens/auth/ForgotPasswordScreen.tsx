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
import { forgotPassword, setVerificationEmail } from "../../store/auth/authSlice"
import { Mail, ArrowLeft } from "lucide-react-native"
import type { AppDispatch } from "../../store"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../types/navigation"

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Silahkan masukkan email Anda")
      return
    }

    setLoading(true)
    try {
      const result = await dispatch(forgotPassword(email)).unwrap()
      setResetSent(true)

      // Set the verification email in the store for the verification screen
      dispatch(setVerificationEmail(email))

      Alert.alert("Sukses", result.message || "Password baru telah dikirim ke email Anda", [
        {
          text: "OK",
          onPress: () => {
            // Navigate to email verification screen
            navigation.navigate("EmailVerification")
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Gagal mengirim email reset. Silahkan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6">
          <TouchableOpacity className="flex-row items-center mb-6" onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#4b5563" />
            <Text className="ml-2 text-gray-600 font-medium">Kembali ke Login</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800">Lupa Password</Text>
            <Text className="text-gray-500 text-center mt-2">
              {resetSent
                ? "Cek email Anda untuk kode verifikasi"
                : "Masukkan email Anda dan kami akan mengirimkan kode verifikasi"}
            </Text>
          </View>

          {!resetSent ? (
            <>
              <View className="space-y-4 mb-6">
                <View className="relative">
                  <View className="absolute left-3 top-3 z-10">
                    <Mail size={20} color="#6b7280" />
                  </View>
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                className={`bg-blue-500 py-3 rounded-lg items-center ${loading ? "opacity-70" : ""}`}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold text-lg ml-2">Mengirim...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-lg">Kirim Kode Verifikasi</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className="bg-blue-500 py-3 rounded-lg items-center mt-4"
              onPress={() => navigation.navigate("EmailVerification")}
            >
              <Text className="text-white font-semibold text-lg">Lanjut ke Verifikasi</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

