"use client"

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ProfileScreen from "../screens/ProfileScreen"
import HomeScreen from "../screens/HomeScreen"
import FitnessStatsScreen from "../screens/profile/FitnessStatsScreen"
import ThemeSettingsScreen from "../screens/profile/ThemeSettingScreen"
import WeightTrackingScreen from "../screens/fitness/WeightTrackingScreen"
import WorkoutsScreen from "../screens/fitness/WorkoutsScreen"
import WorkoutDetailScreen from "../screens/fitness/WorkoutDetailScreen"
import { User, Activity, Home, BarChart } from "lucide-react-native"
import { useTheme } from "../theme/ThemeContext"
import type { AppStackParamList } from "../types/navigation"

const Tab = createBottomTabNavigator<AppStackParamList>()
const HomeStack = createNativeStackNavigator<AppStackParamList>()
const ProfileStack = createNativeStackNavigator<AppStackParamList>()
const FitnessStack = createNativeStackNavigator<AppStackParamList>()
const ProgressStack = createNativeStackNavigator<AppStackParamList>()

// Home Navigator
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="FitnessStats" component={FitnessStatsScreen} />
      <HomeStack.Screen name="Workout" component={WorkoutsScreen} />
      <HomeStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <HomeStack.Screen name="WeightTracking" component={WeightTrackingScreen} />
    </HomeStack.Navigator>
  )
}

// Profile Navigator
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="FitnessStats" component={FitnessStatsScreen} />
      <ProfileStack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <ProfileStack.Screen name="Workout" component={WorkoutsScreen} />
      <ProfileStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <ProfileStack.Screen name="WeightTracking" component={WeightTrackingScreen} />
    </ProfileStack.Navigator>
  )
}

// Fitness Navigator
function FitnessNavigator() {
  return (
    <FitnessStack.Navigator screenOptions={{ headerShown: false }}>
      <FitnessStack.Screen name="Workout" component={WorkoutsScreen} />
      <FitnessStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </FitnessStack.Navigator>
  )
}

// Progress Navigator
function ProgressNavigator() {
  return (
    <ProgressStack.Navigator screenOptions={{ headerShown: false }}>
      <ProgressStack.Screen name="WeightTracking" component={WeightTrackingScreen} />
    </ProgressStack.Navigator>
  )
}

export default function AppNavigator() {
  const { theme } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "HomeTab":
              return <Home size={size} color={color} />
            case "FitnessTab":
              return <Activity size={size} color={color} />
            case "ProgressTab":
              return <BarChart size={size} color={color} />
            case "ProfileTab":
              return <User size={size} color={color} />
            default:
              return null
          }
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="FitnessTab" component={FitnessNavigator} options={{ tabBarLabel: "Workouts" }} />
      <Tab.Screen name="ProgressTab" component={ProgressNavigator} options={{ tabBarLabel: "Progress" }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  )
}

