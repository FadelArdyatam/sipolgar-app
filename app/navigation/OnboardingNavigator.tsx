import { createNativeStackNavigator } from "@react-navigation/native-stack"
import OnboardingScreen from "../screens/onboarding/OnboardingScreen"
import type { OnboardingStackParamList } from "../types/navigation"

const Stack = createNativeStackNavigator<OnboardingStackParamList>()

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  )
}

