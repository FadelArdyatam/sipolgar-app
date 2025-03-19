"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useSelector } from "react-redux"
import { Activity, Scale, Dumbbell, Heart } from "lucide-react-native"
import { useTheme } from "../theme/ThemeContext"
import type { RootState } from "../store"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "../types/navigation"

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, "Home">
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: theme.text }}>
            Halo, {user?.personel?.nama_lengkap?.split(" ")[0] || "Pengguna"}!
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 16 }}>Selamat datang di aplikasi Sipolgar</Text>
        </View>

        {/* Quick Stats */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 16 }}>Statistik Cepat</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: `${theme.primary}20`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Scale size={24} color={theme.primary} />
              </View>
              <Text style={{ color: theme.text, fontWeight: "500" }}>{user?.personel?.berat_badan || "--"} kg</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Berat</Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: `${theme.secondary}20`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Activity size={24} color={theme.secondary} />
              </View>
              <Text style={{ color: theme.text, fontWeight: "500" }}>{user?.personel?.tinggi_badan || "--"} cm</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Tinggi</Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: `${theme.accent}20`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Heart size={24} color={theme.accent} />
              </View>
              <Text style={{ color: theme.text, fontWeight: "500" }}>
                {user?.personel?.fitness_goal
                  ? user.personel.fitness_goal === "lose_weight"
                    ? "Turun BB"
                    : user.personel.fitness_goal === "gain_muscle"
                      ? "Massa Otot"
                      : user.personel.fitness_goal === "maintain"
                        ? "Jaga BB"
                        : "Kebugaran"
                  : "--"}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Tujuan</Text>
            </View>
          </View>
        </View>

        {/* Feature Cards */}
        <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 16 }}>Fitur Utama</Text>

        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 16,
              marginRight: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => navigation.navigate("Workout")}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: `${theme.primary}20`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Dumbbell size={24} color={theme.primary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.text, marginBottom: 4 }}>Latihan</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Lihat berbagai jenis latihan yang tersedia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 16,
              marginLeft: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => navigation.navigate("WeightTracking")}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: `${theme.secondary}20`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Scale size={24} color={theme.secondary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.text, marginBottom: 4 }}>Berat Badan</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Catat dan pantau berat badan Anda</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => navigation.navigate("FitnessStats")}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: `${theme.accent}20`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Activity size={24} color={theme.accent} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.text, marginBottom: 4 }}>
            Statistik Fitness
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            Lihat statistik fitness lengkap Anda termasuk BMI dan kebutuhan kalori
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

