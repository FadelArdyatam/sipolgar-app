// Update the navigation types to include the new screens
export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  ResetPassword: { token: string }
  EmailVerification: undefined
  ChangePassword: { email?: string }
}

export type OnboardingStackParamList = {
  OnboardingScreen: undefined // Changed from "Onboarding" to "OnboardingScreen"
}


export type AppStackParamList = {
  Profile: undefined
  Home: undefined
  Workout: undefined
  Nutrition: undefined
  Progress: undefined
  FitnessStats: undefined
  ThemeSettings: undefined
  WeightTracking: undefined
  Workouts: undefined
  WorkoutDetail: { id: number }
}

export type RootStackParamList = {
  Auth: { screen?: keyof AuthStackParamList }
  Onboarding: undefined
  Main: undefined
}