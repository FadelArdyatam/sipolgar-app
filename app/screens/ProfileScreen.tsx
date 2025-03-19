"use client"

import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../store/auth/authSlice"
import { User, Settings, LogOut, Calendar, ChevronRight, Activity, Palette } from "lucide-react-native"
import { getSatuanKerjaDetail } from "../services/AuthServices"
import { useEffect, useState } from "react"
import type { RootState, AppDispatch } from "../store"
import type { SatuanKerja } from "../types/user"
// Update imports to use the correct navigation types
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "../types/navigation"

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, "Profile">
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [satuanKerja, setSatuanKerja] = useState<SatuanKerja | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSatuanKerjaDetail = async () => {
      if (user?.personel?.id_satuankerja) {
        setLoading(true)
        try {
          const data = await getSatuanKerjaDetail(user.personel.id_satuankerja)
          setSatuanKerja(data)
        } catch (error) {
          console.error("Failed to fetch satuan kerja detail:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchSatuanKerjaDetail()
  }, [user?.personel?.id_satuankerja])

  const handleLogout = () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => dispatch(logout()),
      },
    ])
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading profile...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-500 pt-12 pb-6 px-4 rounded-b-3xl">
        <View className="flex-row items-center">
          <View className="bg-white p-1 rounded-full">
            <Image source={{ uri: "https://via.placeholder.com/100" }} className="w-20 h-20 rounded-full" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">{user.personel?.nama_lengkap || user.name}</Text>
            <Text className="text-blue-100">{user.email}</Text>
            <Text className="text-blue-100">{user.username}</Text>

            <View className="flex-row mt-2">
              <TouchableOpacity className="bg-white bg-opacity-20 px-3 py-1 rounded-full mr-2">
                <Text className="text-white text-sm">Edit Profil</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <Text className="text-white text-sm">Pengaturan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* User Info */}
      <View className="mx-4 -mt-4 bg-white rounded-xl shadow-sm p-4 mb-6">
        <Text className="text-gray-800 font-semibold mb-3">Informasi Pengguna</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Nomor HP</Text>
            <Text className="text-gray-800 font-medium">{user.personel?.no_hp || "Tidak tersedia"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Tempat Lahir</Text>
            <Text className="text-gray-800 font-medium">{user.personel?.tempat_lahir || "Tidak tersedia"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Tanggal Lahir</Text>
            <Text className="text-gray-800 font-medium">{user.personel?.tanggal_lahir || "Tidak tersedia"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Jenis Kelamin</Text>
            <Text className="text-gray-800 font-medium">{user.personel?.jenis_kelamin || "Tidak tersedia"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Satuan Kerja</Text>
            <Text className="text-gray-800 font-medium">
              {loading
                ? "Loading..."
                : satuanKerja?.nama_satuan_kerja || `ID: ${user.personel?.id_satuankerja || "Tidak tersedia"}`}
            </Text>
          </View>
          {user.personel?.tinggi_badan && (
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Tinggi Badan</Text>
              <Text className="text-gray-800 font-medium">{user.personel.tinggi_badan} cm</Text>
            </View>
          )}
          {user.personel?.berat_badan && (
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Berat Badan</Text>
              <Text className="text-gray-800 font-medium">{user.personel.berat_badan} kg</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View className="mx-4 bg-white rounded-xl shadow-sm p-4 mb-6">
        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <User size={18} color="#4b5563" />
            <Text className="text-gray-800 ml-3">Pengaturan Akun</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <Calendar size={18} color="#4b5563" />
            <Text className="text-gray-800 ml-3">Riwayat Aktivitas</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          onPress={() => navigation.navigate("FitnessStats")}
        >
          <View className="flex-row items-center">
            <Activity size={18} color="#4b5563" />
            <Text className="text-gray-800 ml-3">Statistik Fitness</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <Settings size={18} color="#4b5563" />
            <Text className="text-gray-800 ml-3">Pengaturan Aplikasi</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          onPress={() => navigation.navigate("ThemeSettings")}
        >
          <View className="flex-row items-center">
            <Palette size={18} color="#4b5563" />
            <Text className="text-gray-800 ml-3">Pengaturan Tema</Text>
          </View>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between py-3" onPress={handleLogout}>
          <View className="flex-row items-center">
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-500 ml-3">Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

