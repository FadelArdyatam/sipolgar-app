"use client"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { ArrowLeft, Moon, Sun, Check, Palette } from "lucide-react-native"
import { useTheme } from "../../theme/ThemeContext"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "../../types/navigation"
import { useDispatch } from "react-redux"
import { updateUserProfile } from "../../store/auth/authSlice"
import type { AppDispatch } from "../../store"

type ThemeSettingsScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, "ThemeSettings">
}

export default function ThemeSettingsScreen({ navigation }: ThemeSettingsScreenProps) {
  const { theme, themeName, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  const dispatch = useDispatch<AppDispatch>()

  const themeOptions = [
    { id: "default", name: "Biru (Default)", color: "#3b82f6" },
    { id: "green", name: "Hijau", color: "#059669" },
    { id: "purple", name: "Ungu", color: "#8b5cf6" },
    { id: "blue", name: "Biru Tua", color: "#2563eb" },
  ]

  const handleThemeChange = async (newThemeName: "default" | "blue" | "green" | "purple") => {
    setTheme(newThemeName)

    // Save theme preference to user profile
    try {
      await dispatch(
        updateUserProfile({
          personel: {
            theme_preference: newThemeName,
          },
        }),
      )
    } catch (error) {
      console.error("Failed to save theme preference to profile:", error)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={theme.text} />
          <Text style={{ marginLeft: 8, color: theme.text, fontWeight: "500" }}>Kembali</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: `${theme.primary}30`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Palette size={32} color={theme.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text, marginBottom: 8 }}>Pengaturan Tema</Text>
          <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
            Sesuaikan tampilan aplikasi dengan tema yang Anda sukai
          </Text>
        </View>

        {/* Dark mode toggle */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 16 }}>Mode Tampilan</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: !isDarkMode ? theme.primary : "transparent",
                alignItems: "center",
                marginRight: 8,
                borderWidth: !isDarkMode ? 0 : 1,
                borderColor: theme.border,
              }}
              onPress={() => (!isDarkMode ? null : toggleDarkMode())}
            >
              <Sun size={24} color={!isDarkMode ? "white" : theme.text} />
              <Text
                style={{
                  marginTop: 8,
                  fontWeight: "500",
                  color: !isDarkMode ? "white" : theme.text,
                }}
              >
                Light
              </Text>
              {!isDarkMode && (
                <View style={{ position: "absolute", top: 8, right: 8 }}>
                  <Check size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDarkMode ? theme.primary : "transparent",
                alignItems: "center",
                marginLeft: 8,
                borderWidth: isDarkMode ? 0 : 1,
                borderColor: theme.border,
              }}
              onPress={() => (isDarkMode ? null : toggleDarkMode())}
            >
              <Moon size={24} color={isDarkMode ? "white" : theme.text} />
              <Text
                style={{
                  marginTop: 8,
                  fontWeight: "500",
                  color: isDarkMode ? "white" : theme.text,
                }}
              >
                Dark
              </Text>
              {isDarkMode && (
                <View style={{ position: "absolute", top: 8, right: 8 }}>
                  <Check size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Color theme options */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 16 }}>Warna Tema</Text>

          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: option.id !== themeOptions[themeOptions.length - 1].id ? 1 : 0,
                borderBottomColor: theme.border,
              }}
              onPress={() => handleThemeChange(option.id as any)}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: option.color,
                  marginRight: 16,
                }}
              />
              <Text style={{ flex: 1, color: theme.text }}>{option.name}</Text>
              {themeName === option.id && <Check size={20} color={theme.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

