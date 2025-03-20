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
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Lock, KeyRound, ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { changePassword, markPasswordChangeCompleted, logout } from "../../store/auth/authSlice";
import type { AppDispatch, RootState } from "../../store";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../types/navigation";

type ChangePasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ChangePassword">;
  route: {
    params?: {
      email?: string;
      isFirstLogin?: boolean;
    };
  };
};

export default function ChangePasswordScreen({ navigation, route }: ChangePasswordScreenProps) {
  const { email, isFirstLogin } = route.params || {};
  const { token, user, requiresPasswordChange } = useSelector((state: RootState) => state.auth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const isForcedPasswordChange = isFirstLogin && requiresPasswordChange;

  useEffect(() => {
    if (!token && !email) {
      navigation.replace("Login");
    }
  }, [token, email, navigation]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Harap isi semua field");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Password baru tidak cocok dengan konfirmasi password");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password baru harus minimal 8 karakter");
      return;
    }

    console.log("Available routes before navigation:", navigation.getState().routes);

    setLoading(true);
    try {
      await dispatch(changePassword({ current_password: currentPassword, new_password: newPassword })).unwrap();

      // Set passwordChanged flag to true
      await dispatch(markPasswordChangeCompleted());

      console.log(navigation.getState().routes);
      // Navigate based on the flow
      if (isForcedPasswordChange) {
        navigation.replace("Onboarding"); // Replace current screen with Onboarding
      } else {
        navigation.replace("Onboarding"); // Replace current screen with Main
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Gagal", error instanceof Error ? error.message : "Gagal mengubah password. Silahkan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (isForcedPasswordChange) {
      // Show alert for forced password change
      Alert.alert(
        "Perhatian",
        "Anda harus mengubah password sebelum melanjutkan. Apakah Anda ingin keluar dari aplikasi?",
        [
          {
            text: "Batal",
            style: "cancel",
          },
          {
            text: "Keluar",
            onPress: () => {
              dispatch(logout());
              navigation.replace("Login"); // Navigate to Login after logout
            },
          },
        ],
      );
    } else if (navigation.canGoBack()) {
      navigation.goBack(); // Go back if possible
    } else {
      navigation.replace("Main"); // Fallback navigation
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 justify-center">
          {!isForcedPasswordChange && (
            <TouchableOpacity className="flex-row items-center mb-6" onPress={handleBackPress}>
              <ArrowLeft size={20} color="#4b5563" />
              <Text className="ml-2 text-gray-600 font-medium">Kembali</Text>
            </TouchableOpacity>
          )}

          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              {isForcedPasswordChange ? "Ubah Password" : "Buat Password Baru"}
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              {isForcedPasswordChange
                ? "Untuk keamanan akun Anda, silahkan ubah password default dengan password baru"
                : `Silahkan masukkan password yang diberikan sistem dan buat password baru untuk akun ${email || user?.email || ""}`}
            </Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <KeyRound size={20} color="#6b7280" />
              </View>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-10 py-3 text-gray-700"
                placeholder={isForcedPasswordChange ? "Password Default" : "Password Saat Ini"}
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
              <Text className="text-white font-semibold text-lg">
                {isForcedPasswordChange ? "Ubah Password & Lanjutkan" : "Simpan Password Baru"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}