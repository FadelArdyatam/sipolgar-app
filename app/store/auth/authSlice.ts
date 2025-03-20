import { createSlice, createAsyncThunk, type PayloadAction, createAction } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as authService from "../../services/AuthServices"
import type { UserProfile, AuthState, PersonelUpdate } from "../../types/user"

// Update initialState to include requiresPasswordChange
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  requiresEmailVerification: false,
  requiresPasswordChange: false, // Add this field
  verificationEmail: null,
  expiresAt: null,
  requiresPasswordChange: false,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password)

      // Store authentication data in AsyncStorage
      await AsyncStorage.setItem("userToken", response.token)
      await AsyncStorage.setItem("userData", JSON.stringify(response.user))
      if (response.expiresAt) {
        await AsyncStorage.setItem("tokenExpiresAt", response.expiresAt)
      }

      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed")
    }
  },
)

export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      nama_lengkap: string
      username: string
      email: string
      no_hp: string
      tempat_lahir: string
      tanggal_lahir: string
      id_satuankerja: number
      jenis_kelamin?: string
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.register(userData)

      return {
        message: response.message,
        email: userData.email,
        user: response.user,
        personel: response.personel,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed")
    }
  },
)

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(email, otp)
      return {
        message: response.message,
        email: email,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "OTP verification failed")
    }
  },
)

export const checkVerification = createAsyncThunk(
  "auth/checkVerification",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.checkVerification(email)
      return {
        isVerified: response.is_verified,
        status: response.status,
        email: email,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check verification status")
    }
  },
)

export const regenerateOTP = createAsyncThunk("auth/regenerateOTP", async (email: string, { rejectWithValue }) => {
  try {
    const response = await authService.regenerateOTP(email)
    return {
      message: response.message,
      email: email,
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to regenerate OTP")
  }
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email: string, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(email)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to send reset email")
  }
})

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { current_password, new_password }: { current_password: string; new_password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.changePassword(current_password, new_password)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to change password")
    }
  },
)

export const getUserProfile = createAsyncThunk("auth/getUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getUserProfile()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to get user profile")
  }
})

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData: { personel?: PersonelUpdate } & Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await authService.updateUserProfile(profileData)
      return {
        message: response.message,
        user: response.user,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update profile")
    }
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout()
})

// Add a new action to mark password change as completed
export const passwordChangeCompletedAction = createAction("auth/passwordChangeCompleted")

// Add the reducer for this action
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreUser: (state, action: PayloadAction<{ token: string; user: UserProfile; expiresAt?: string }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      if (action.payload.expiresAt) {
        state.expiresAt = action.payload.expiresAt
      }
    },
    updateUserProfileLocal: (state, action: PayloadAction<{ personel?: PersonelUpdate } & Partial<UserProfile>>) => {
      if (state.user) {
        // Handle nested personel object if it exists in the payload
        if (action.payload.personel && state.user.personel) {
          state.user = {
            ...state.user,
            ...action.payload,
            personel: {
              ...state.user.personel,
              ...action.payload.personel,
            },
          }
        } else {
          state.user = {
            ...state.user,
            ...action.payload,
          }
        }

        // Update user data in AsyncStorage
        AsyncStorage.setItem("userData", JSON.stringify(state.user)).catch((error) =>
          console.error("Failed to update user data in AsyncStorage:", error),
        )

        // Mark onboarding as completed if fitness data is provided
        if (action.payload.personel?.tinggi_badan && action.payload.personel?.berat_badan) {
          AsyncStorage.setItem("onboardingCompleted", "true").catch((error) =>
            console.error("Failed to update onboarding status in AsyncStorage:", error),
          )
        }
      }
    },
    clearError: (state) => {
      state.error = null
    },
    clearEmailVerification: (state) => {
      state.requiresEmailVerification = false
      state.verificationEmail = null
    },
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload
      state.requiresEmailVerification = true
    },
    passwordChangeCompleted: (state) => {
      state.requiresPasswordChange = false
      if (state.user) {
        state.user.needs_password_change = false
        // Update user data in AsyncStorage
        AsyncStorage.setItem("userData", JSON.stringify(state.user)).catch((error) =>
          console.error("Failed to update user data in AsyncStorage:", error),
        )
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.expiresAt = action.payload.expiresAt

        // If this is a new user who just verified their email, they need to change their password
        if (action.payload.user.needs_password_change) {
          state.requiresPasswordChange = true
        } else {
          state.requiresPasswordChange = false
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Login failed"
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.requiresEmailVerification = true
        state.verificationEmail = action.payload.email
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Registration failed"
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false
        state.requiresEmailVerification = false
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "OTP verification failed"
      })

      // Check Verification
      .addCase(checkVerification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkVerification.fulfilled, (state, action) => {
        state.loading = false
        if (state.user && action.payload.email === state.user.email) {
          state.user.isVerified = action.payload.isVerified
        }
      })
      .addCase(checkVerification.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to check verification status"
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to send reset email"
      })

      // Regenerate OTP
      .addCase(regenerateOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(regenerateOTP.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(regenerateOTP.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to regenerate OTP"
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false
        // Update token if a new one is provided
        if (action.payload.token) {
          state.token = action.payload.token
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to change password"
      })

      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to get user profile"
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.user) {
          state.user = action.payload.user
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to update profile"
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.requiresEmailVerification = false
        state.verificationEmail = null
        state.expiresAt = null
      })
  },
})

// Export the new action
export const {
  restoreUser,
  updateUserProfileLocal,
  clearError,
  clearEmailVerification,
  setVerificationEmail,
  passwordChangeCompleted,
} = authSlice.actions

export default authSlice.reducer

