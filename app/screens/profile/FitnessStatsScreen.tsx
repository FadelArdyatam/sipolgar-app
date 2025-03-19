"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useSelector } from "react-redux"
import { ArrowLeft, Activity } from "lucide-react-native"
import type { RootState } from "../../store"
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTargets,
  calculateAge,
} from "../../utils/fitnessCalculation"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "../../types/navigation"

type FitnessStatsScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, "FitnessStats">
}

export default function FitnessStatsScreen({ navigation }: FitnessStatsScreenProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    height: 0,
    weight: 0,
    bmi: 0,
    bmiCategory: "",
    bmr: 0,
    tdee: 0,
    targetCalories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  useEffect(() => {
    if (user?.personel) {
      calculateStats()
    }
    setLoading(false)
  }, [user])

  const calculateStats = () => {
    if (
      !user?.personel?.tinggi_badan ||
      !user?.personel?.berat_badan ||
      !user?.personel?.tanggal_lahir ||
      !user?.personel?.jenis_kelamin
    ) {
      return
    }

    const height = user.personel.tinggi_badan
    const weight = user.personel.berat_badan

    // Calculate BMI
    const bmi = calculateBMI(weight, height)
    const bmiCategory = getBMICategory(bmi)

    // Calculate BMR
    const age = calculateAge(user.personel.tanggal_lahir)
    const bmr = calculateBMR(weight, height, age, user.personel.jenis_kelamin)

    // Calculate TDEE based on activity level
    const activityLevel = user.personel.activity_level || "moderate"
    const tdee = calculateTDEE(bmr, activityLevel)

    // Calculate calorie targets based on fitness goal
    const fitnessGoal = user.personel.fitness_goal || "maintain"
    const calorieTargets = calculateCalorieTargets(tdee, fitnessGoal)

    setStats({
      height,
      weight,
      bmi,
      bmiCategory,
      bmr,
      tdee,
      targetCalories: calorieTargets.target,
      protein: calorieTargets.protein,
      carbs: calorieTargets.carbs,
      fat: calorieTargets.fat,
    })
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-500">Memuat data fitness...</Text>
      </View>
    )
  }

  if (!user?.personel?.tinggi_badan || !user?.personel?.berat_badan) {
    return (
      <View className="flex-1 p-6 justify-center items-center bg-gray-50">
        <Activity size={60} color="#3b82f6" />
        <Text className="text-xl font-bold text-gray-800 mt-4">Data Fitness Belum Lengkap</Text>
        <Text className="text-gray-500 text-center mt-2">
          Lengkapi data tinggi dan berat badan di profil Anda untuk melihat statistik fitness.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-lg items-center mt-6"
          onPress={() => navigation.navigate("Profile")}
        >
          <Text className="text-white font-semibold text-lg">Lengkapi Profil</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <TouchableOpacity className="flex-row items-center mb-6" onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#4b5563" />
          <Text className="ml-2 text-gray-600 font-medium">Kembali</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-800 mb-6">Statistik Fitness</Text>

        {/* Basic Metrics */}
        <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Metrik Dasar</Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Tinggi Badan</Text>
            <Text className="font-medium">{stats.height} cm</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Berat Badan</Text>
            <Text className="font-medium">{stats.weight} kg</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Indeks Massa Tubuh (BMI)</Text>
            <Text className="font-medium">{stats.bmi.toFixed(1)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-500">Kategori BMI</Text>
            <Text className={`font-medium ${getBmiCategoryColor(stats.bmiCategory)}`}>{stats.bmiCategory}</Text>
          </View>
        </View>

        {/* Calorie Information */}
        <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Informasi Kalori</Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">BMR (Basal Metabolic Rate)</Text>
            <Text className="font-medium">{Math.round(stats.bmr)} kkal</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Total Kalori Harian (TDEE)</Text>
            <Text className="font-medium">{Math.round(stats.tdee)} kkal</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Target Kalori</Text>
            <Text className="font-medium">{Math.round(stats.targetCalories)} kkal</Text>
          </View>

          <View className="h-px bg-gray-200 my-3" />

          <Text className="text-gray-700 font-medium mb-3">Distribusi Makronutrien</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Protein</Text>
            <Text className="font-medium">{stats.protein}g</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Karbohidrat</Text>
            <Text className="font-medium">{stats.carbs}g</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-500">Lemak</Text>
            <Text className="font-medium">{stats.fat}g</Text>
          </View>
        </View>

        {/* BMI Scale Visualization */}
        <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Skala BMI</Text>

          <View className="h-8 flex-row rounded-lg overflow-hidden mb-2">
            <View className="flex-1 bg-blue-400" />
            <View className="flex-1 bg-green-400" />
            <View className="flex-1 bg-yellow-400" />
            <View className="flex-1 bg-red-400" />
          </View>

          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500">Kekurangan</Text>
            <Text className="text-xs text-gray-500">Normal</Text>
            <Text className="text-xs text-gray-500">Kelebihan</Text>
            <Text className="text-xs text-gray-500">Obesitas</Text>
          </View>

          <View className="mt-3 items-center">
            <View
              className="h-4 w-4 bg-gray-800 rounded-full"
              style={{
                marginLeft: `${Math.min(Math.max(((stats.bmi - 15) / 20) * 100, 0), 100)}%`,
                marginRight: `${100 - Math.min(Math.max(((stats.bmi - 15) / 20) * 100, 0), 100)}%`,
              }}
            />
          </View>
        </View>

        <TouchableOpacity className="bg-blue-500 py-3 rounded-lg items-center mb-10">
          <Text className="text-white font-semibold text-lg">Perbarui Data Fitness</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

// Helper function to get the appropriate color for BMI category
const getBmiCategoryColor = (category: string): string => {
  switch (category) {
    case "Kekurangan berat badan":
      return "text-blue-500"
    case "Normal":
      return "text-green-500"
    case "Kelebihan berat badan":
      return "text-yellow-600"
    case "Obesitas":
      return "text-red-500"
    default:
      return "text-gray-800"
  }
}

