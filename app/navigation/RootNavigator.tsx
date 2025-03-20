// Update the RootNavigator to handle the improved flow
"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import AppNavigator from "./AppNavigator"
import AuthNavigator from "./AuthNavigator"
import OnboardingNavigator from "./OnboardingNavigator"
import { restoreUser } from "../store/auth/authSlice"
import type { RootState, AppDispatch } from "../store"
import type { RootStackParamList } from "../types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, requiresEmailVerification, user, requiresPasswordChange } = useSelector(
    (state: RootState) => state.auth,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    // Check for stored authentication token
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken")
        const userData = await AsyncStorage.getItem("userData")
        const expiresAt = await AsyncStorage.getItem("tokenExpiresAt")
        const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted")

        if (token && userData) {
          const parsedUserData = JSON.parse(userData)
          dispatch(
            restoreUser({
              token,
              user: parsedUserData,
              expiresAt: expiresAt || undefined,
            }),
          )

          // Check if user needs onboarding
          // This could be based on whether the user has fitness data
          const needsOnboarding =
            !onboardingCompleted || !parsedUserData.personel?.tinggi_badan || !parsedUserData.personel?.berat_badan

          setNeedsOnboarding(needsOnboarding)
        }
      } catch (error) {
        console.error("Failed to restore authentication state:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [dispatch])

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated || requiresEmailVerification ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : requiresPasswordChange ? (
        // If user needs to change password, show the auth navigator which will handle the flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={AppNavigator} />
      )}
    </Stack.Navigator>
  )
}

