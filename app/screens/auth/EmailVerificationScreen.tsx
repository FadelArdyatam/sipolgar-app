"use client"

import { useRef } from "react"
import { useState, useEffect } from "react"
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
import { regenerateOTP, clearError, verifyOTP } from "../../store/auth/authSlice"
import { ArrowLeft } from "lucide-react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../types/navigation"
import type { AppDispatch, RootState } from "../../store"
import { clearEmailVerification } from "../../store/auth/authSlice"

type EmailVerificationScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "EmailVerification">
}

export default function EmailVerificationScreen({ navigation }: EmailVerificationScreenProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, verificationEmail } = useSelector((state: RootState) => state.auth)

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [verifying, setVerifying] = useState(false)

  const inputRefs = useRef<Array<TextInput | null>>([])

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError())

    // Focus on first input
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [dispatch])

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 60
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendDisabled])

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]
    }

    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Update the handleVerify function to navigate to Login after successful verification
  const handleVerify = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      Alert.alert("Error", "Silahkan masukkan kode OTP 6 digit")
      return
    }

    if (!verificationEmail) {
      Alert.alert("Error", "Email tidak ditemukan. Silahkan coba lagi.")
      return
    }

    setVerifying(true)
    try {
      // Call the verify OTP API through Redux
      await dispatch(verifyOTP({ email: verificationEmail, otp: otpString })).unwrap()

      // Clear the email verification requirement
      dispatch(clearEmailVerification())

      // Navigate to login screen instead of change password
      Alert.alert("Sukses", "Email berhasil diverifikasi. Silahkan login untuk melanjutkan.", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Login")
          },
        },
      ])
    } catch (error) {
      console.error("OTP verification error:", error)
      Alert.alert("Gagal", error instanceof Error ? error.message : "Verifikasi OTP gagal. Silahkan coba lagi.")
    } finally {
      setVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    if (!verificationEmail) {
      Alert.alert("Error", "Email tidak ditemukan. Silahkan coba lagi.")
      return
    }

    try {
      console.log("Attempting to regenerate OTP for email:", verificationEmail)
      const result = await dispatch(regenerateOTP(verificationEmail)).unwrap()
      console.log("OTP regeneration result:", result)

      setResendDisabled(true)
      Alert.alert("Sukses", result.message || "Kode verifikasi baru telah dikirim ke email Anda")

      // Clear OTP fields
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (error) {
      console.error("Failed to regenerate OTP:", error)
      // Error is handled by the useEffect above
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6">
          <TouchableOpacity className="flex-row items-center mb-6" onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#4b5563" />
            <Text className="ml-2 text-gray-600 font-medium">Kembali</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800">Verifikasi Email</Text>
            <Text className="text-gray-500 text-center mt-2">Kami telah mengirimkan kode verifikasi ke</Text>
            <Text className="text-blue-500 font-medium mt-1">{verificationEmail || "email Anda"}</Text>
          </View>

          <View className="mb-8">
            <Text className="text-gray-700 font-medium mb-4 text-center">Masukkan kode 6 digit</Text>
            <View className="flex-row justify-between">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  className="bg-white border border-gray-300 rounded-lg w-12 h-12 text-center text-xl font-bold text-gray-800"
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            className={`bg-blue-500 py-3 rounded-lg items-center ${verifying ? "opacity-70" : ""}`}
            onPress={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-2">Memverifikasi...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Verifikasi Email</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Tidak menerima kode? </Text>
            {resendDisabled ? (
              <Text className="text-gray-400">Kirim ulang dalam {countdown}d</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                <Text className="text-blue-500 font-medium">Kirim Ulang Kode</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

