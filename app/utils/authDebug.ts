import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Debug utility to check authentication state
 * This can be called from any screen to help troubleshoot auth issues
 */
export const debugAuthState = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken")
    const userData = await AsyncStorage.getItem("userData")
    const expiresAt = await AsyncStorage.getItem("tokenExpiresAt")
    const passwordChanged = await AsyncStorage.getItem("passwordChanged")
    const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted")
    const isFirstLogin = await AsyncStorage.getItem("isFirstLogin")

    console.log("=== AUTH DEBUG INFO ===")
    console.log("Token exists:", !!token)
    console.log("User data exists:", !!userData)
    console.log("Token expires at:", expiresAt || "Not set")
    console.log("Password changed:", passwordChanged || "Not set")
    console.log("Onboarding completed:", onboardingCompleted || "Not set")
    console.log("Is first login:", isFirstLogin || "Not set")

    if (userData) {
      const user = JSON.parse(userData)
      console.log("User email:", user.email)
      console.log("User has personel data:", !!user.personel)
      if (user.personel) {
        console.log("User has height:", !!user.personel.tinggi_badan)
        console.log("User has weight:", !!user.personel.berat_badan)
      }
    }

    console.log("======================")

    return {
      hasToken: !!token,
      hasUserData: !!userData,
      passwordChanged: !!passwordChanged,
      onboardingCompleted: !!onboardingCompleted,
      isFirstLogin: isFirstLogin === "true",
    }
  } catch (error) {
    console.error("Error in debugAuthState:", error)
    return null
  }
}

/**
 * Reset authentication state for testing
 * WARNING: This will log the user out
 */
export const resetAuthState = async () => {
  try {
    await AsyncStorage.removeItem("userToken")
    await AsyncStorage.removeItem("userData")
    await AsyncStorage.removeItem("tokenExpiresAt")
    await AsyncStorage.removeItem("passwordChanged")
    await AsyncStorage.removeItem("onboardingCompleted")
    await AsyncStorage.removeItem("isFirstLogin")
    console.log("Auth state reset successfully")
    return true
  } catch (error) {
    console.error("Error resetting auth state:", error)
    return false
  }
}

/**
 * Reset specific auth flags for testing
 * This allows testing different auth flows without logging out
 */
export const resetAuthFlags = async (flags: {
  passwordChanged?: boolean
  onboardingCompleted?: boolean
  isFirstLogin?: boolean
}) => {
  try {
    if (flags.passwordChanged !== undefined) {
      if (flags.passwordChanged) {
        await AsyncStorage.setItem("passwordChanged", "true")
      } else {
        await AsyncStorage.removeItem("passwordChanged")
      }
    }

    if (flags.onboardingCompleted !== undefined) {
      if (flags.onboardingCompleted) {
        await AsyncStorage.setItem("onboardingCompleted", "true")
      } else {
        await AsyncStorage.removeItem("onboardingCompleted")
      }
    }

    if (flags.isFirstLogin !== undefined) {
      if (flags.isFirstLogin) {
        await AsyncStorage.setItem("isFirstLogin", "true")
      } else {
        await AsyncStorage.setItem("isFirstLogin", "false")
      }
    }

    console.log("Auth flags updated:", flags)
    return true
  } catch (error) {
    console.error("Error updating auth flags:", error)
    return false
  }
}

