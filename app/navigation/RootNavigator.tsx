import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import AppNavigator from "./AppNavigator";
import { restoreUser } from "../store/auth/authSlice";
import type { RootState, AppDispatch } from "../store";
import ChangePasswordScreen from "../screens/auth/ChangePasswordScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, requiresPasswordChange, needsOnboarding } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userData = await AsyncStorage.getItem("userData");

        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          dispatch(restoreUser({ token, user: parsedUserData }));
        }
      } catch (error) {
        console.error("Failed to restore authentication state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

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
      ) : requiresPasswordChange ? (
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
}