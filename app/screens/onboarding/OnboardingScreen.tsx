"use client"

import { useState, useEffect, useRef } from "react"
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
  Dimensions,
  Animated,
  Image,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { updateUserProfile, logout, updateUserProfileLocal, setNeedsOnboarding } from "../../store/auth/authSlice"
import { ChevronRight, ArrowLeft, Activity, Dumbbell, Award, Heart, UserCheck, Check } from "lucide-react-native"
import type { AppDispatch, RootState } from "../../store"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { OnboardingStackParamList } from "../../types/navigation"
import { useTheme } from "../../theme/ThemeContext"
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTargets,
  calculateAge,
} from "../../utils/fitnessCalculation"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CommonActions } from "@react-navigation/native"
import { PersonelUpdate, UserProfile } from "../../types/user"
import { saveWeightData } from "../../services/WeightTrackingService"

const { width } = Dimensions.get("window")

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "OnboardingScreen">
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { theme } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Update the state variables to store numeric values
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState<string | null>(null)
  const [activityLevel, setActivityLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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

  // Animation effect when changing steps
  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0)
    slideAnim.setValue(50)

    // Run animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [currentStep])

  // Pre-fill values if user already has data
  useEffect(() => {
    if (user?.personel?.tinggi_badan) {
      setHeight(user.personel.tinggi_badan.toString());
    }
    if (user?.personel?.berat_badan) {
      setWeight(user.personel.berat_badan.toString());
    }
    if (user?.personel?.fitness_goal) {
      setFitnessGoal(user.personel.fitness_goal);
    }
    if (user?.personel?.activity_level) {
      setActivityLevel(user.personel.activity_level);
    }
  }, [user]);

  const fitnessGoals = [
    {
      id: "lose_weight",
      label: "Menurunkan Berat Badan",
      icon: <Activity size={24} color={theme.primary} />,
      description: "Fokus pada defisit kalori untuk menurunkan lemak tubuh",
    },
    {
      id: "gain_muscle",
      label: "Menambah Massa Otot",
      icon: <Dumbbell size={24} color={theme.primary} />,
      description: "Fokus pada latihan kekuatan dan surplus kalori",
    },
    {
      id: "maintain",
      label: "Menjaga Berat Badan",
      icon: <Heart size={24} color={theme.primary} />,
      description: "Pertahankan komposisi tubuh saat ini",
    },
    {
      id: "improve_fitness",
      label: "Meningkatkan Kebugaran",
      icon: <Award size={24} color={theme.primary} />,
      description: "Tingkatkan daya tahan dan performa keseluruhan",
    },
  ]

  const activityLevels = [
    { id: "sedentary", label: "Jarang Berolahraga", description: "Aktivitas fisik minimal" },
    { id: "light", label: "Olahraga Ringan", description: "1-2 hari/minggu" },
    { id: "moderate", label: "Olahraga Sedang", description: "3-5 hari/minggu" },
    { id: "active", label: "Olahraga Aktif", description: "6-7 hari/minggu" },
    { id: "very_active", label: "Sangat Aktif", description: "Atlet/Pelatihan Intensif" },
  ]

  // Calculate fitness metrics when both height and weight are entered
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

  // Handler to save profile and track weight
  const handleSaveProfile = async () => {
    if (!height || !weight || !fitnessGoal || !activityLevel) {
      Alert.alert("Error", "Harap isi semua data");
      return;
    }

    setLoading(true);
    try {
      const heightNum = Number.parseFloat(height);
      const weightNum = Number.parseFloat(weight);

      // Tipe data yang benar untuk updateUserProfile
      const updateData: { personel?: PersonelUpdate } & Partial<UserProfile> = {
        personel: {
          tinggi_badan: heightNum,
          berat_badan: weightNum,
          fitness_goal: fitnessGoal,
          activity_level: activityLevel,
        },
      };

      // Update profil pengguna
      await dispatch(updateUserProfile(updateData)).unwrap();
      dispatch(updateUserProfileLocal(updateData));
      
      // Simpan data berat badan ke API tracking
      try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        await saveWeightData({
          berat_badan: weightNum,
          minggu_ke: 1, // Minimal 1 karena validasi API
          tgl_berat_badan: formattedDate,
        });
        console.log("Data berat badan berhasil disimpan ke tracking");
      } catch (weightError) {
        console.error("Gagal menyimpan data berat badan ke tracking:", weightError);
        // Lanjutkan meskipun gagal menyimpan data berat
      }

      // Set flag onboarding completed
      await AsyncStorage.setItem("onboardingCompleted", "true");
      console.log("Onboarding flag set to true in handleSaveProfile");
      
      // Update redux state
      dispatch(setNeedsOnboarding(false));

      Alert.alert("Sukses", "Profil berhasil disimpan", [
        {
          text: "OK",
          onPress: () => {
            // Reset navigasi ke Main
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            );
          },
        },
      ]);
    } catch (error) {
      console.error("Save profile error:", error);
      Alert.alert("Gagal", "Gagal menyimpan profil. Silahkan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    Alert.alert(
      "Kembali ke Login",
      "Anda yakin ingin kembali ke halaman login? Data yang sudah diisi tidak akan tersimpan.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya, Kembali",
          onPress: () => {
            dispatch(logout())
          },
        },
      ],
    )
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!height || !weight) {
        Alert.alert("Error", "Harap isi tinggi dan berat badan Anda")
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!fitnessGoal) {
        Alert.alert("Error", "Harap pilih tujuan fitness Anda")
        return
      }
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getBmiCategoryColor = (category: string | null): string => {
    if (!category) return theme.text

    switch (category) {
      case "Kekurangan berat badan":
        return theme.info
      case "Normal":
        return theme.success
      case "Kelebihan berat badan":
        return theme.warning
      case "Obesitas":
        return theme.error
      default:
        return theme.text
    }
  }

  const renderStepIndicator = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {[1, 2, 3].map((step) => (
          <View key={step} className="flex-row items-center">
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  step === currentStep ? theme.primary : step < currentStep ? theme.success : theme.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {step < currentStep ? (
                <Check size={20} color="#fff" />
              ) : (
                <Text style={{ color: "white", fontWeight: "bold" }}>{step}</Text>
              )}
            </View>
            {step < 3 && (
              <View
                style={{
                  height: 3,
                  width: 30,
                  backgroundColor: step < currentStep ? theme.success : theme.border,
                }}
              />
            )}
          </View>
        ))}
      </View>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Image
                source={require("../../../assets/images/fitness-goals.png")}
                style={{ width: 120, height: 120, marginBottom: 16 }}
              />
              <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text, marginBottom: 8 }}>Ukuran Tubuh</Text>
              <Text style={{ textAlign: "center", color: theme.textSecondary }}>
                Pengukuran yang akurat membantu kami memberikan rekomendasi yang tepat untuk Anda
              </Text>
            </View>

            <View className="space-y-6">
              <View>
                <Text style={{ color: theme.text, fontWeight: "500", marginBottom: 8 }}>Tinggi Badan (cm)</Text>
                <TextInput
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: theme.text,
                  }}
                  placeholder="Contoh: 170"
                  placeholderTextColor={theme.textSecondary}
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
                <Text style={{ color: theme.text, fontWeight: "500", marginBottom: 8 }}>Berat Badan (kg)</Text>
                <TextInput
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: theme.text,
                  }}
                  placeholder="Contoh: 65"
                  placeholderTextColor={theme.textSecondary}
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
                <View
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${theme.primary}30`,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.primary, marginBottom: 8 }}>
                    Hasil Perhitungan
                  </Text>

                  {fitnessStats.bmi !== null && (
                    <View className="flex-row justify-between mb-2">
                      <Text style={{ color: theme.text }}>BMI (Indeks Massa Tubuh):</Text>
                      <Text style={{ fontWeight: "500", color: theme.text }}>{fitnessStats.bmi.toFixed(1)}</Text>
                    </View>
                  )}

                  {fitnessStats.bmiCategory && (
                    <View className="flex-row justify-between mb-2">
                      <Text style={{ color: theme.text }}>Kategori BMI:</Text>
                      <Text style={{ fontWeight: "500", color: getBmiCategoryColor(fitnessStats.bmiCategory) }}>
                        {fitnessStats.bmiCategory}
                      </Text>
                    </View>
                  )}

                  {/* BMI Scale Visualization */}
                  {fitnessStats.bmi !== null && (
                    <View className="mt-3">
                      <View className="h-4 flex-row rounded-lg overflow-hidden mb-1">
                        <View style={{ flex: 1, backgroundColor: theme.info }} />
                        <View style={{ flex: 1, backgroundColor: theme.success }} />
                        <View style={{ flex: 1, backgroundColor: theme.warning }} />
                        <View style={{ flex: 1, backgroundColor: theme.error }} />
                      </View>
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>Kurang</Text>
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>Normal</Text>
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>Lebih</Text>
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>Obesitas</Text>
                      </View>
                      <View className="mt-1 items-center">
                        <View
                          style={{
                            height: 12,
                            width: 12,
                            backgroundColor: theme.text,
                            borderRadius: 6,
                            marginLeft: `${Math.min(Math.max(((fitnessStats.bmi - 15) / 20) * 100, 0), 100)}%`,
                            marginRight: `${100 - Math.min(Math.max(((fitnessStats.bmi - 15) / 20) * 100, 0), 100)}%`,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        )
      case 2:
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Image
                source={require("../../../assets/images/fitness-goals.png")}
                style={{ width: 120, height: 120, marginBottom: 16 }}
              />
              <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text, marginBottom: 8 }}>
                Tujuan Fitness
              </Text>
              <Text style={{ textAlign: "center", color: theme.textSecondary, marginBottom: 16 }}>
                Pilih tujuan fitness yang ingin Anda capai untuk mendapatkan rekomendasi yang sesuai
              </Text>
            </View>
            <View className="space-y-3">
              {fitnessGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    backgroundColor: fitnessGoal === goal.id ? `${theme.primary}10` : theme.card,
                    borderColor: fitnessGoal === goal.id ? theme.primary : theme.border,
                  }}
                  onPress={() => setFitnessGoal(goal.id)}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${theme.primary}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 16,
                    }}
                  >
                    {goal.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "600",
                        color: fitnessGoal === goal.id ? theme.primary : theme.text,
                        marginBottom: 4,
                        fontSize: 16,
                      }}
                    >
                      {goal.label}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{goal.description}</Text>
                  </View>
                  {fitnessGoal === goal.id && <ChevronRight size={20} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )
      case 3:
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Image
                source={require("../../../assets/images/fitness-goals.png")}
                style={{ width: 120, height: 120, marginBottom: 16 }}
              />
              <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text, marginBottom: 8 }}>
                Tingkat Aktivitas
              </Text>
              <Text style={{ textAlign: "center", color: theme.textSecondary, marginBottom: 16 }}>
                Pilih tingkat aktivitas fisik Anda sehari-hari untuk perhitungan kalori yang akurat
              </Text>
            </View>
            <View className="space-y-3 mb-6">
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    backgroundColor: activityLevel === level.id ? `${theme.primary}10` : theme.card,
                    borderColor: activityLevel === level.id ? theme.primary : theme.border,
                  }}
                  onPress={() => setActivityLevel(level.id)}
                >
                  <View className="flex-row justify-between items-center">
                    <Text
                      style={{
                        fontWeight: "600",
                        color: activityLevel === level.id ? theme.primary : theme.text,
                        fontSize: 16,
                      }}
                    >
                      {level.label}
                    </Text>
                    {activityLevel === level.id && <ChevronRight size={20} color={theme.primary} />}
                  </View>
                  <Text style={{ color: theme.textSecondary, marginTop: 4, fontSize: 14 }}>{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {fitnessStats.dailyCalories !== null && fitnessStats.targetCalories !== null && (
              <View
                style={{
                  backgroundColor: `${theme.primary}10`,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${theme.primary}30`,
                  marginBottom: 24,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.primary, marginBottom: 8 }}>
                  Kebutuhan Kalori
                </Text>
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: theme.text }}>Kebutuhan Kalori Harian:</Text>
                  <Text style={{ fontWeight: "500", color: theme.text }}>
                    {Math.round(fitnessStats.dailyCalories)} kkal
                  </Text>
                </View>
                {fitnessGoal && (
                  <View className="flex-row justify-between mb-2">
                    <Text style={{ color: theme.text }}>
                      Target Kalori ({fitnessGoals.find((g) => g.id === fitnessGoal)?.label}):
                    </Text>
                    <Text style={{ fontWeight: "500", color: theme.text }}>
                      {Math.round(fitnessStats.targetCalories)} kkal
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        )
      default:
        return null
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 24 }}>
          {/* Header with back button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleBackToLogin}>
              <ArrowLeft size={20} color={theme.textSecondary} />
              <Text style={{ marginLeft: 8, color: theme.textSecondary, fontWeight: "500" }}>Kembali</Text>
            </TouchableOpacity>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: `${theme.primary}20`,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: theme.primary, fontWeight: "600" }}>Langkah {currentStep}/3</Text>
            </View>
          </View>

          {/* Logo and welcome message */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <UserCheck size={40} color="white" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text, marginBottom: 4 }}>
              Selamat Datang{user?.personel?.nama_lengkap ? `, ${user.personel.nama_lengkap.split(" ")[0]}!` : "!"}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                textAlign: "center",
                paddingHorizontal: 16,
              }}
            >
              Kami perlu beberapa informasi untuk menyesuaikan program fitness Anda
            </Text>
          </View>

          {/* Step indicator */}
          {renderStepIndicator()}

          {/* Step content */}
          <View style={{ marginBottom: 24 }}>{renderStepContent()}</View>

          {/* Navigation buttons */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
            {currentStep > 1 ? (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.background,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onPress={handlePrevStep}
              >
                <Text style={{ color: theme.text, fontWeight: "500" }}>Kembali</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {currentStep < 3 ? (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={handleNextStep}
              >
                <Text style={{ color: "white", fontWeight: "500", marginRight: 4 }}>Lanjut</Text>
                <ChevronRight size={16} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  opacity: loading ? 0.7 : 1,
                }}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={{ color: "white", fontWeight: "500", marginLeft: 8 }}>Menyimpan...</Text>
                  </View>
                ) : (
                  <Text style={{ color: "white", fontWeight: "500" }}>Simpan & Lanjutkan</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}