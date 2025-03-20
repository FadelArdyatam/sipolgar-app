export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: undefined;
  ChangePassword: { email?: string; isFirstLogin?: boolean };
  Onboarding: undefined;
  Main: undefined 
};

export type OnboardingStackParamList = {
  OnboardingScreen: undefined;
  Main: undefined;
};

export type AppStackParamList = {
  Profile: undefined;
  Home: undefined;
  Workout: undefined;
  Nutrition: undefined;
  Progress: undefined;
  FitnessStats: undefined;
  ThemeSettings: undefined;
  WeightTracking: undefined;
  Workouts: undefined;
  WorkoutDetail: { id: number };
  HomeTab: undefined;
  FitnessTab: undefined;
  WorkoutTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: { screen?: keyof AuthStackParamList };
  ChangePassword: { email?: string; isFirstLogin?: boolean };
  Onboarding: undefined;
  Main: undefined;
};