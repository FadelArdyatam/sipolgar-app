import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ProfileScreen from "../screens/ProfileScreen"
import FitnessStatsScreen from "../screens/profile/FitnessStatsScreen"
import { User } from "lucide-react-native"
import type { AppStackParamList } from "../types/navigation"

const Tab = createBottomTabNavigator<AppStackParamList>()
const ProfileStack = createNativeStackNavigator<AppStackParamList>()

// Create a ProfileNavigator component
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="FitnessStats" component={FitnessStatsScreen} />
    </ProfileStack.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "ProfileTab":
              return <User size={size} color={color} />
            default:
              return null
          }
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: "Profil" }} />
    </Tab.Navigator>
  )
}

