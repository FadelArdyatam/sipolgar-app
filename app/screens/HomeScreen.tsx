"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { useSelector } from "react-redux"
import { Calendar, Clock, TrendingUp, Award, ChevronRight, Bell } from "lucide-react-native"
import type { RootState } from "../store"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import type { AppStackParamList } from "../navigation/types"

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<AppStackParamList, "Home">
}

const { width } = Dimensions.get("window")

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyProgress: 0,
    streak: 0,
  })
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([
    {
      id: "1",
      title: "Latihan Kardio",
      time: "08:00 - 09:00",
      date: "Hari ini",
    },
    {
      id: "2",
      title: "Latihan Kekuatan",
      time: "15:00 - 16:00",
      date: "Besok",
    },
  ])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        totalWorkouts: 12,
        weeklyProgress: 75,
        streak: 5,
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-500">Memuat data...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-6 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-blue-100">Selamat Datang,</Text>
            <Text className="text-white text-xl font-bold">{user?.username || "Pengguna"}</Text>
          </View>
          <TouchableOpacity className="relative">
            <Bell size={24} color="white" />
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-xs">3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-4 -mt-4">
        <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <Text className="text-gray-800 font-semibold mb-3">Statistik Aktivitas</Text>
          <View className="flex-row justify-between">
            <View className="items-center bg-blue-50 p-3 rounded-lg flex-1 mr-2">
              <Calendar size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.totalWorkouts}</Text>
              <Text className="text-gray-500 text-xs">Total Latihan</Text>
            </View>
            <View className="items-center bg-green-50 p-3 rounded-lg flex-1 mr-2">
              <TrendingUp size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.weeklyProgress}%</Text>
              <Text className="text-gray-500 text-xs">Progress Minggu Ini</Text>
            </View>
            <View className="items-center bg-orange-50 p-3 rounded-lg flex-1">
              <Award size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.streak}</Text>
              <Text className="text-gray-500 text-xs">Streak Hari</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Upcoming Workouts */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-800 font-semibold">Jadwal Latihan</Text>
          <TouchableOpacity>
            <Text className="text-blue-500">Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {upcomingWorkouts.map((workout) => (
          <TouchableOpacity key={workout.id} className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-lg mr-3">
                <Clock size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">{workout.title}</Text>
                <Text className="text-gray-500 text-sm">{workout.time}</Text>
                <Text className="text-blue-500 text-sm">{workout.date}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Program Latihan */}
      <View className="px-4 mb-6">
        <Text className="text-gray-800 font-semibold mb-3">Program Latihan</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity className="bg-white rounded-xl shadow-sm mr-3" style={{ width: width * 0.7 }}>
            <Image
              source={{ uri: "https://via.placeholder.com/400x200/3b82f6/FFFFFF?text=Kardio" }}
              className="w-full h-32 rounded-t-xl"
            />
            <View className="p-3">
              <Text className="text-gray-800 font-medium">Program Kardio</Text>
              <Text className="text-gray-500 text-sm">30 menit • Tingkat Pemula</Text>
              <View className="flex-row items-center mt-2">
                <View className="flex-1 h-2 bg-gray-200 rounded-full">
                  <View className="bg-blue-500 h-2 rounded-full" style={{ width: "40%" }} />
                </View>
                <Text className="text-gray-500 text-xs ml-2">40%</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl shadow-sm mr-3" style={{ width: width * 0.7 }}>
            <Image
              source={{ uri: "https://via.placeholder.com/400x200/10b981/FFFFFF?text=Kekuatan" }}
              className="w-full h-32 rounded-t-xl"
            />
            <View className="p-3">
              <Text className="text-gray-800 font-medium">Latihan Kekuatan</Text>
              <Text className="text-gray-500 text-sm">45 menit • Tingkat Menengah</Text>
              <View className="flex-row items-center mt-2">
                <View className="flex-1 h-2 bg-gray-200 rounded-full">
                  <View className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }} />
                </View>
                <Text className="text-gray-500 text-xs ml-2">25%</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl shadow-sm" style={{ width: width * 0.7 }}>
            <Image
              source={{ uri: "https://via.placeholder.com/400x200/f59e0b/FFFFFF?text=Fleksibilitas" }}
              className="w-full h-32 rounded-t-xl"
            />
            <View className="p-3">
              <Text className="text-gray-800 font-medium">Latihan Fleksibilitas</Text>
              <Text className="text-gray-500 text-sm">20 menit • Semua Tingkat</Text>
              <View className="flex-row items-center mt-2">
                <View className="flex-1 h-2 bg-gray-200 rounded-full">
                  <View className="bg-orange-500 h-2 rounded-full" style={{ width: "10%" }} />
                </View>
                <Text className="text-gray-500 text-xs ml-2">10%</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tips Kesehatan */}
      <View className="px-4 mb-8">
        <Text className="text-gray-800 font-semibold mb-3">Tips Kesehatan</Text>
        <TouchableOpacity className="bg-white rounded-xl shadow-sm p-4">
          <Text className="text-gray-800 font-medium mb-2">Pentingnya Hidrasi Selama Berolahraga</Text>
          <Text className="text-gray-500 text-sm mb-3">
            Minum air yang cukup sebelum, selama, dan setelah berolahraga sangat penting untuk menjaga performa dan
            mencegah dehidrasi.
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-blue-500 font-medium">Baca Selengkapnya</Text>
            <ChevronRight size={16} color="#3b82f6" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

