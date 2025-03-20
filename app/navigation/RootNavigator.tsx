import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import AppNavigator from "./AppNavigator";
import { restoreUser, setNeedsOnboarding } from "../store/auth/authSlice";
import type { RootState, AppDispatch } from "../store";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, needsOnboarding } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userData = await AsyncStorage.getItem("userData");
        const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted");

        console.log("Auth check - Token exists:", !!token);
        console.log("Auth check - User data exists:", !!userData);
        console.log("Auth check - Onboarding completed:", onboardingCompleted);

        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          
          // Restore user data to Redux
          dispatch(restoreUser({ token, user: parsedUserData }));
          
          // Ensure needsOnboarding state is in sync with AsyncStorage flag
          const hasRequiredData = 
            parsedUserData.personel?.tinggi_badan && 
            parsedUserData.personel?.berat_badan;
          
          // If user has required data but onboardingCompleted flag is not set, set it
          if (hasRequiredData && onboardingCompleted !== "true") {
            console.log("Setting onboardingCompleted flag based on user data");
            await AsyncStorage.setItem("onboardingCompleted", "true");
          }
          
          // If user doesn't have required data but flag is set, remove it
          if (!hasRequiredData && onboardingCompleted === "true") {
            console.log("Removing onboardingCompleted flag since user data is incomplete");
            await AsyncStorage.removeItem("onboardingCompleted");
          }
          
          // Set Redux state based on both user data and AsyncStorage flag
          const shouldShowOnboarding = !hasRequiredData && onboardingCompleted !== "true";
          if (shouldShowOnboarding !== needsOnboarding) {
            console.log("Updating needsOnboarding state:", shouldShowOnboarding);
            dispatch(setNeedsOnboarding(shouldShowOnboarding));
          }
        }
      } catch (error) {
        console.error("Failed to restore authentication state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Effect to sync onboarding status whenever user data changes
  useEffect(() => {
    const syncOnboardingStatus = async () => {
      if (isAuthenticated && user) {
        const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted");
        
        // If user has height and weight data
        if (user.personel?.tinggi_badan && user.personel?.berat_badan) {
          // But onboarding flag is not set
          if (onboardingCompleted !== "true") {
            await AsyncStorage.setItem("onboardingCompleted", "true");
            console.log("Set onboardingCompleted flag based on user profile data");
          }
          
          // Update Redux if needed
          if (needsOnboarding) {
            dispatch(setNeedsOnboarding(false));
            console.log("Updated redux needsOnboarding to false");
          }
        } else {
          // User doesn't have height and weight data
          // But flag is set as completed
          if (onboardingCompleted === "true") {
            await AsyncStorage.removeItem("onboardingCompleted");
            console.log("Removed onboardingCompleted flag due to missing user data");
          }
          
          // Update Redux if needed
          if (!needsOnboarding) {
            dispatch(setNeedsOnboarding(true));
            console.log("Updated redux needsOnboarding to true");
          }
        }
      }
    };
    
    syncOnboardingStatus();
  }, [isAuthenticated, user, needsOnboarding, dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
}