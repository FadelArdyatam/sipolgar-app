import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"
import { logApiCall, logApiResponse, logApiError } from "../api/logger"
import { checkNetworkBeforeCall } from "../api/networkMonitor"
import type {
  UserProfile,
  SatuanKerja,
  SatuanKerjaParent,
  SatuanKerjaChild,
  LoginResponse,
  RegisterResponse,
  RegenerateOTPResponse,
  VerifyOTPResponse,
  ForgotPasswordResponse,
  ChangePasswordResponse,
  UpdateProfileResponse,
  PersonelUpdate,
} from "../types/user"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    logApiResponse(response.config.url || "", response.data)
    return response
  },
  (error) => {
    logApiError(error.config?.url || "unknown", error)

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error("Network error. Please check your connection and try again."))
    }

    // Handle API errors with appropriate messages
    const errorMessage = error.response.data?.message || "An unexpected error occurred"
    return Promise.reject(new Error(errorMessage))
  },
)

// Add request interceptor to automatically add auth token
api.interceptors.request.use(
  async (config) => {
    logApiCall(config.method?.toUpperCase() || "UNKNOWN", config.url || "", config.data)

    // Check network connection
    const isConnected = await checkNetworkBeforeCall()
    if (!isConnected) {
      throw new Error("No internet connection. Please check your network settings.")
    }

    const token = await AsyncStorage.getItem("userToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Update the login function to handle the needs_password_change flag
export const login = async (
  username: string,
  password: string,
): Promise<{ token: string; user: UserProfile; expiresAt: string }> => {
  try {
    const response = await api.post<LoginResponse>("/login", {
      username,
      password,
    })

    console.log("Login response:", JSON.stringify(response.data, null, 2))

    if (response.data.token) {
      // Check if this is a new user who needs to change their password
      // This could be determined by a flag in the API response or by checking if the password is temporary
      const needsPasswordChange = response.data.user.needs_password_change || false

      // Add the flag to the user object
      const userWithPasswordChangeFlag = {
        ...response.data.user,
        needs_password_change: needsPasswordChange,
      }

      // Store token for future authenticated requests
      await AsyncStorage.setItem("userToken", response.data.token)

      // Store user data with the password change flag
      await AsyncStorage.setItem("userData", JSON.stringify(userWithPasswordChangeFlag))

      // Store expiration time if available
      if (response.data.expires_at) {
        await AsyncStorage.setItem("tokenExpiresAt", response.data.expires_at)
      }

      return {
        token: response.data.token,
        user: userWithPasswordChangeFlag,
        expiresAt: response.data.expires_at,
      }
    }

    throw new Error("Login failed: No token received")
  } catch (error) {
    throw error
  }
}

// Register user - updated to match API documentation
export const register = async (userData: {
  nama_lengkap: string
  username: string
  email: string
  no_hp: string
  tempat_lahir: string
  tanggal_lahir: string
  id_satuankerja: number
  jenis_kelamin?: string
}): Promise<RegisterResponse> => {
  try {
    // Log the registration request with sensitive data redacted


    const response = await api.post<RegisterResponse>("/register", userData)

    console.log("Registration response:", response.data)
    return response.data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Verify OTP code
export const verifyOTP = async (email: string, otp: string): Promise<VerifyOTPResponse> => {
  try {
    const response = await api.post<VerifyOTPResponse>("/verify-email-otp", {
      email,
      otp_code: otp,
    })

    return response.data
  } catch (error) {
    console.error("OTP verification error:", error)
    throw error
  }
}

// Check verification status
export const checkVerification = async (email: string): Promise<{ is_verified: boolean; status: boolean }> => {
  try {
    const response = await api.post("/check-verification", { email })
    return response.data
  } catch (error) {
    console.error("Check verification error:", error)
    throw error
  }
}

// Change password
export const changePassword = async (
  current_password: string,
  new_password: string,
): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post<ChangePasswordResponse>("/change-password", {
      current_password,
      new_password,
    })

    // If a new token is returned, update it in storage
    if (response.data.token) {
      await AsyncStorage.setItem("userToken", response.data.token)
    }

    return response.data
  } catch (error) {
    console.error("Change password error:", error)
    throw error
  }
}

// Forgot password
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>("/forgot-password", { email })
    return response.data
  } catch (error) {
    console.error("Forgot password error:", error)
    throw error
  }
}

// Regenerate OTP
export const regenerateOTP = async (email: string): Promise<RegenerateOTPResponse> => {
  try {
    const response = await api.post<RegenerateOTPResponse>("/regenerate-otp", { email })
    console.log("Regenerate OTP response:", response.data)
    return response.data
  } catch (error) {
    console.error("Regenerate OTP error:", error)
    throw error
  }
}

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get("/users")
    return response.data.user
  } catch (error) {
    console.error("Get user profile error:", error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (profileData: PersonelUpdate): Promise<UpdateProfileResponse> => {
  try {
    const response = await api.post<UpdateProfileResponse>("/users/update", profileData)

    // Update stored user data if available
    if (response.data.user) {
      await AsyncStorage.setItem("userData", JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

// Get all satuan kerja - with retry mechanism
export const getAllSatuanKerja = async (retryCount = 0): Promise<SatuanKerja[]> => {
  try {
    console.log("Fetching all satuan kerja")
    const response = await api.get("/satuan-kerja")
    console.log("All satuan kerja response:", response.data)
    return response.data.data || []
  } catch (error) {
    console.error("Failed to fetch all satuan kerja:", error)

    // Add retry logic (max 2 retries)
    if (retryCount < 2) {
      console.log(`Retrying getAllSatuanKerja (attempt ${retryCount + 1})`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      return getAllSatuanKerja(retryCount + 1)
    }

    return []
  }
}

// Get parent satuan kerja - with retry mechanism
export const getParentSatuanKerja = async (retryCount = 0): Promise<SatuanKerjaParent[]> => {
  try {
    console.log("Fetching parent satuan kerja")
    const response = await api.get("/satuan-kerja/parents")
    console.log("Parent satuan kerja response:", response.data)
    return response.data.data || []
  } catch (error) {
    console.error("Failed to fetch parent satuan kerja:", error)

    // Add retry logic (max 2 retries)
    if (retryCount < 2) {
      console.log(`Retrying getParentSatuanKerja (attempt ${retryCount + 1})`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      return getParentSatuanKerja(retryCount + 1)
    }

    return []
  }
}

// Get child satuan kerja by parent ID - with retry mechanism
export const getChildSatuanKerja = async (parentId: number, retryCount = 0): Promise<SatuanKerjaChild[]> => {
  try {
    console.log(`Fetching child satuan kerja for parent ID: ${parentId}`)
    const response = await api.get(`/satuan-kerja/children/${parentId}`)
    console.log("Child satuan kerja response:", response.data)
    return response.data.data || []
  } catch (error) {
    console.error(`Failed to fetch child satuan kerja for parent ID ${parentId}:`, error)

    // Add retry logic (max 2 retries)
    if (retryCount < 2) {
      console.log(`Retrying getChildSatuanKerja (attempt ${retryCount + 1})`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      return getChildSatuanKerja(parentId, retryCount + 1)
    }

    return []
  }
}

// Get satuan kerja detail by ID
export const getSatuanKerjaDetail = async (id: number): Promise<SatuanKerja | null> => {
  try {
    const response = await api.get(`/satuan-kerja/${id}`)
    return response.data.data || null
  } catch (error) {
    console.error(`Failed to fetch satuan kerja detail for ID ${id}:`, error)
    return null
  }
}

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Clear local storage
    await AsyncStorage.removeItem("userToken")
    await AsyncStorage.removeItem("userData")
    await AsyncStorage.removeItem("tokenExpiresAt")
    await AsyncStorage.removeItem("onboardingCompleted")
  } catch (error) {
    console.error("Logout error:", error)
    // Still clear storage even if API call fails
    await AsyncStorage.removeItem("userToken")
    await AsyncStorage.removeItem("userData")
    await AsyncStorage.removeItem("tokenExpiresAt")
    await AsyncStorage.removeItem("onboardingCompleted")
  }
}

