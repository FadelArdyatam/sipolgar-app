"use client"

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
import { updateUserProfile } from "../../store/auth/authSlice"
import { ChevronRight } from "lucide-react-native"
import type { AppDispatch, RootState } from "../../store"
// Update imports to use the correct navigation types
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { OnboardingStackParamList } from "../../types/navigation"

// Add import for the fitness calculations at the top of the file
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTargets,
  calculateAge,
} from "../../utils/fitnessCalculation"

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "Onboarding">
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)

  // Update the state variables to store numeric values
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState<string | null>(null)
  const [activityLevel, setActivityLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fitnessStats, setFitnessStats] = useState<{
    bmi: number | null
    bmiCategory: string | null
    dailyCalories: number | null
    targetCalories: number | null
  }>({
    bmi: null,
    bmiCategory: null,
    dailyCalories: null,
    targetCalories: null,
  })

  const fitnessGoals = [
    { id: "lose_weight", label: "Menurunkan Berat Badan" },
    { id: "gain_muscle", label: "Menambah Massa Otot" },
    { id: "maintain", label: "Menjaga Berat Badan" },
    { id: "improve_fitness", label: "Meningkatkan Kebugaran" },
  ]

  const activityLevels = [
    { id: "sedentary", label: "Jarang Berolahraga" },
    { id: "light", label: "Olahraga Ringan (1-2 hari/minggu)" },
    { id: "moderate", label: "Olahraga Sedang (3-5 hari/minggu)" },
    { id: "active", label: "Olahraga Aktif (6-7 hari/minggu)" },
    { id: "very_active", label: "Sangat Aktif (Atlet/Pelatihan Intensif)" },
  ]

  // Add a function to calculate fitness metrics when both height and weight are entered
  const calculateFitnessMetrics = () => {
    const heightNum = Number.parseFloat(height)
    const weightNum = Number.parseFloat(weight)

    if (!isNaN(heightNum) && !isNaN(weightNum) && user?.personel?.tanggal_lahir && user?.personel?.jenis_kelamin) {
      const bmi = calculateBMI(weightNum, heightNum)
      const bmiCategory = getBMICategory(bmi)

      const age = calculateAge(user.personel.tanggal_lahir)
      const bmr = calculateBMR(weightNum, heightNum, age, user.personel.jenis_kelamin)

      let tdee = bmr
      if (activityLevel) {
        tdee = calculateTDEE(bmr, activityLevel)
      }

      let targetCalories = tdee
      if (fitnessGoal) {
        const calorieTargets = calculateCalorieTargets(tdee, fitnessGoal)
        targetCalories = calorieTargets.target
      }

      setFitnessStats({
        bmi,
        bmiCategory,
        dailyCalories: tdee,
        targetCalories,
      })
    }
  }

  // Add effect to run calculations when values change
  useEffect(() => {
    calculateFitnessMetrics()
  }, [height, weight, activityLevel, fitnessGoal])

  // Update the save profile handler to convert height and weight to numbers
  const handleSaveProfile = async () => {
    if (!height || !weight || !fitnessGoal || !activityLevel) {
      Alert.alert("Error", "Harap isi semua data")
      return
    }

    setLoading(true)
    try {
      // Convert string values to numbers before saving
      const heightNum = Number.parseFloat(height)
      const weightNum = Number.parseFloat(weight)

      // Update user profile with fitness data
      await dispatch(
        updateUserProfile({
          personel: {
            tinggi_badan: heightNum,
            berat_badan: weightNum,
            fitness_goal: fitnessGoal,
            activity_level: activityLevel,
          },
        }),
      )

      Alert.alert("Sukses", "Profil berhasil disimpan", [
        {
          text: "OK",
          onPress: () => {
            // Navigate to main app
            navigation.navigate('Onboarding');
          },
        },
      ])
    } catch (error) {
      console.error("Save profile error:", error)
      Alert.alert("Gagal", "Gagal menyimpan profil. Silahkan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">Selamat Datang!</Text>
            <Text className="text-gray-500 text-center mt-2">
              Kami perlu beberapa informasi untuk menyesuaikan program fitness Anda
            </Text>
          </View>

          <View className="space-y-6 mb-6">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Tinggi Badan (cm)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                placeholder="Contoh: 170"
                value={height}
                onChangeText={(text) => {
                  // Only allow numeric input
                  const numericValue = text.replace(/[^0-9]/g, "")
                  setHeight(numericValue)
                }}
                keyboardType="number-pad"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Berat Badan (kg)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                placeholder="Contoh: 65"
                value={weight}
                onChangeText={(text) => {
                  // Only allow numeric input
                  const numericValue = text.replace(/[^0-9]/g, "")
                  setWeight(numericValue)
                }}
                keyboardType="number-pad"
              />
            </View>

            {!!height && !!weight && (
              <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <Text className="text-lg font-bold text-blue-800 mb-2">Hasil Perhitungan Fitness</Text>

                {fitnessStats.bmi !== null && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">BMI (Indeks Massa Tubuh):</Text>
                    <Text className="font-medium">{fitnessStats.bmi.toFixed(1)}</Text>
                  </View>
                )}

                {fitnessStats.bmiCategory && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">Kategori BMI:</Text>
                    <Text className="font-medium">{fitnessStats.bmiCategory}</Text>
                  </View>
                )}

                {fitnessStats.dailyCalories !== null && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">Kebutuhan Kalori Harian:</Text>
                    <Text className="font-medium">{Math.round(fitnessStats.dailyCalories)} kkal</Text>
                  </View>
                )}

                {fitnessStats.targetCalories !== null && fitnessGoal && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">
                      Target Kalori ({fitnessGoals.find((g) => g.id === fitnessGoal)?.label}):
                    </Text>
                    <Text className="font-medium">{Math.round(fitnessStats.targetCalories)} kkal</Text>
                  </View>
                )}
              </View>
            )}

            <View>
              <Text className="text-gray-700 font-medium mb-2">Tujuan Fitness</Text>
              <View className="space-y-2">
                {fitnessGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    className={`flex-row items-center justify-between p-3 rounded-lg border ${
                      fitnessGoal === goal.id ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
                    }`}
                    onPress={() => setFitnessGoal(goal.id)}
                  >
                    <Text className={`${fitnessGoal === goal.id ? "text-blue-500 font-medium" : "text-gray-700"}`}>
                      {goal.label}
                    </Text>
                    {fitnessGoal === goal.id && <ChevronRight size={20} color="#3b82f6" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Tingkat Aktivitas</Text>
              <View className="space-y-2">
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    className={`flex-row items-center justify-between p-3 rounded-lg border ${
                      activityLevel === level.id ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
                    }`}
                    onPress={() => setActivityLevel(level.id)}
                  >
                    <Text className={`${activityLevel === level.id ? "text-blue-500 font-medium" : "text-gray-700"}`}>
                      {level.label}
                    </Text>
                    {activityLevel === level.id && <ChevronRight size={20} color="#3b82f6" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            className={`bg-blue-500 py-3 rounded-lg items-center ${loading ? "opacity-70" : ""}`}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-2">Menyimpan...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Simpan & Lanjutkan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

