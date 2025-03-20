// Update AuthNavigator to handle the improved flow
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useSelector } from "react-redux"
import LoginScreen from "../screens/auth/LoginScreen"
import RegisterScreen from "../screens/auth/RegisterScreen"
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen"
import EmailVerificationScreen from "../screens/auth/EmailVerificationScreen"
import ChangePasswordScreen from "../screens/auth/ChangePasswordScreen"
import type { AuthStackParamList } from "../types/navigation"
import type { RootState } from "../store"

const Stack = createNativeStackNavigator<AuthStackParamList>()

export default function AuthNavigator() {
  const { requiresEmailVerification, requiresPasswordChange, user } = useSelector((state: RootState) => state.auth)

  // Determine the initial route based on auth state
  let initialRoute: keyof AuthStackParamList = "Login"

  if (requiresEmailVerification) {
    initialRoute = "EmailVerification"
  } else if (requiresPasswordChange && user) {
    initialRoute = "ChangePassword"
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}

