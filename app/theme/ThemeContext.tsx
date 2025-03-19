"use client"

// Create a theme context and provider for theme management
import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { themes, type ThemeName, type ThemeColors, defaultTheme } from "./Theme"

interface ThemeContextType {
  theme: ThemeColors
  themeName: ThemeName
  setTheme: (themeName: ThemeName) => void
  isDarkMode: boolean
  toggleDarkMode: () => void
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  themeName: "default",
  setTheme: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
})

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>("default")
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Load saved theme preferences
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeName = (await AsyncStorage.getItem("themeName")) as ThemeName | null
        const darkMode = await AsyncStorage.getItem("darkMode")

        if (savedThemeName && themes[savedThemeName]) {
          setThemeName(savedThemeName)
        }

        if (darkMode) {
          setIsDarkMode(darkMode === "true")
        }
      } catch (error) {
        console.error("Failed to load theme preferences:", error)
      }
    }

    loadTheme()
  }, [])

  // Save theme changes
  const handleSetTheme = async (name: ThemeName) => {
    try {
      setThemeName(name)
      await AsyncStorage.setItem("themeName", name)
    } catch (error) {
      console.error("Failed to save theme preference:", error)
    }
  }

  // Toggle dark mode
  const handleToggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode
      setIsDarkMode(newValue)
      await AsyncStorage.setItem("darkMode", newValue.toString())
    } catch (error) {
      console.error("Failed to save dark mode preference:", error)
    }
  }

  // Current theme based on selected theme name and dark mode
  const currentTheme = isDarkMode ? themes.dark : themes[themeName]

  // Context value
  const contextValue: ThemeContextType = {
    theme: currentTheme,
    themeName,
    setTheme: handleSetTheme,
    isDarkMode,
    toggleDarkMode: handleToggleDarkMode,
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

// Custom hook for using theme
export const useTheme = () => useContext(ThemeContext)

// Export default
export default ThemeContext

