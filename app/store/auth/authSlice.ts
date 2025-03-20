import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../../services/AuthServices";
import type { UserProfile, AuthState, PersonelUpdate } from "../../types/user";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  requiresEmailVerification: false,
  verificationEmail: null,
  expiresAt: null,
  isFirstLogin: false,
  needsOnboarding: true,
};

// Mark password change as completed
export const markPasswordChangeCompleted = createAsyncThunk(
  "auth/markPasswordChangeCompleted",
  async (_, { dispatch }) => {
    await AsyncStorage.setItem("passwordChanged", "true");
    return true;
  }
);

// Check if it's the first login
export const checkFirstLogin = createAsyncThunk("auth/checkFirstLogin", async (_, { dispatch }) => {
  const isFirstLogin = await AsyncStorage.getItem("isFirstLogin");
  return isFirstLogin !== "false";
});

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);

      await AsyncStorage.setItem("userToken", response.token);
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));
      if (response.expiresAt) {
        await AsyncStorage.setItem("tokenExpiresAt", response.expiresAt);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      nama_lengkap: string;
      username: string;
      email: string;
      no_hp: string;
      tempat_lahir: string;
      tanggal_lahir: string;
      id_satuankerja: number;
      jenis_kelamin?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.register(userData);
      return {
        message: response.message,
        email: userData.email,
        user: response.user,
        personel: response.personel,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(email, otp);
      return {
        message: response.message,
        email: email,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "OTP verification failed");
    }
  }
);

// Check verification status
export const checkVerification = createAsyncThunk(
  "auth/checkVerification",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.checkVerification(email);
      return {
        isVerified: response.is_verified,
        status: response.status,
        email: email,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check verification status");
    }
  }
);

// Regenerate OTP
export const regenerateOTP = createAsyncThunk("auth/regenerateOTP", async (email: string, { rejectWithValue }) => {
  try {
    const response = await authService.regenerateOTP(email);
    return {
      message: response.message,
      email: email,
    };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to regenerate OTP");
  }
});

// Forgot password
export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email: string, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(email);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to send reset email");
  }
});

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { current_password, new_password }: { current_password: string; new_password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.changePassword(current_password, new_password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to change password");
    }
  }
);

// Get user profile
export const getUserProfile = createAsyncThunk("auth/getUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getUserProfile();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to get user profile");
  }
});

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData: { personel?: PersonelUpdate } & Partial<UserProfile>, { rejectWithValue, getState }) => {
    try {
      const response = await authService.updateUserProfile(profileData);

      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;

      const updatedUser = { ...response.user };

      if (profileData.personel && updatedUser.personel) {
        updatedUser.personel = {
          ...updatedUser.personel,
          ...profileData.personel,
        };
      } else if (profileData.personel && currentUser?.personel && !updatedUser.personel) {
        updatedUser.personel = {
          ...currentUser.personel,
          ...profileData.personel,
        };
      }

      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      if (profileData.personel?.tinggi_badan && profileData.personel?.berat_badan) {
        await AsyncStorage.setItem("onboardingCompleted", "true");
      }

      return {
        message: response.message,
        user: updatedUser,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);

// Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Ubah restoreUser action
restoreUser: (state, action: PayloadAction<{ token: string; user: UserProfile; expiresAt?: string }>) => {
  state.token = action.payload.token;
  state.user = action.payload.user;
  state.isAuthenticated = true;
  if (action.payload.expiresAt) {
    state.expiresAt = action.payload.expiresAt;
  }

  // Set needsOnboarding based on tinggi_badan and berat_badan
  const needsOnboarding =
    !action.payload.user.personel?.tinggi_badan || !action.payload.user.personel?.berat_badan;
  state.needsOnboarding = needsOnboarding;
},
    updateUserProfileLocal: (state, action: PayloadAction<{ personel?: PersonelUpdate } & Partial<UserProfile>>) => {
      if (state.user) {
        if (action.payload.personel && state.user.personel) {
          state.user = {
            ...state.user,
            ...action.payload,
            personel: {
              ...state.user.personel,
              ...action.payload.personel,
            },
          };

          if (action.payload.personel.tinggi_badan && action.payload.personel.berat_badan) {
            state.needsOnboarding = false;
          }
        } else {
          state.user = {
            ...state.user,
            ...action.payload,
          };
        }

        AsyncStorage.setItem("userData", JSON.stringify(state.user)).catch((error) =>
          console.error("Failed to update user data in AsyncStorage:", error)
        );

        if (action.payload.personel?.tinggi_badan && action.payload.personel?.berat_badan) {
          AsyncStorage.setItem("onboardingCompleted", "true").catch((error) =>
            console.error("Failed to update onboarding status in AsyncStorage:", error)
          );
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearEmailVerification: (state) => {
      state.requiresEmailVerification = false;
      state.verificationEmail = null;
    },
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload;
      state.requiresEmailVerification = true;
    },
    setRequiresPasswordChange: (state, action: PayloadAction<boolean>) => {
      state.requiresPasswordChange = action.payload;
    },
    setNeedsOnboarding: (state, action: PayloadAction<boolean>) => {
      state.needsOnboarding = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.expiresAt = action.payload.expiresAt;
      
        // Set needsOnboarding based on tinggi_badan and berat_badan
        const needsOnboarding =
          !action.payload.user.personel?.tinggi_badan || !action.payload.user.personel?.berat_badan;
        state.needsOnboarding = needsOnboarding;
      })
      
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresEmailVerification = true;
        state.verificationEmail = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Registration failed";
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.requiresEmailVerification = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "OTP verification failed";
      })
      .addCase(checkVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVerification.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && action.payload.email === state.user.email) {
          state.user = {
            ...state.user,
            isVerified: action.payload.isVerified,
          };
        }
      })
      .addCase(checkVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to check verification status";
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to send reset email";
      })
      .addCase(regenerateOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(regenerateOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(regenerateOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to regenerate OTP";
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresPasswordChange = false;
      
        // Update token jika ada token baru
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      
        // Update status passwordChanged di state
        if (state.user?.personel) {
          state.user.personel.passwordChanged = true;
          
          // Pastikan untuk menyimpan perubahan ini ke AsyncStorage
          if (state.user) {
            AsyncStorage.setItem("userData", JSON.stringify(state.user)).catch(err => 
              console.error("Failed to update userData in AsyncStorage:", err)
            );
          }
        } else {
          // Jika personel tidak ada, kita tidak bisa membuat personel baru yang tidak lengkap
          // Sebaiknya catat peringatan bahwa personel tidak ada
          console.warn("User doesn't have personel data to update passwordChanged flag");
          
          // Alternatif: jika API menyediakan data personel dalam respons, gunakan itu
          if (action.payload.user?.personel) {
            if (state.user) {
              state.user.personel = action.payload.user.personel;
              state.user.personel.passwordChanged = true;
              
              AsyncStorage.setItem("userData", JSON.stringify(state.user)).catch(err => 
                console.error("Failed to update userData in AsyncStorage:", err)
              );
            }
          }
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to change password";
      })
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to get user profile";
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user && action.payload.user.id !== undefined) {
          state.user = {
            ...state.user,
            ...action.payload.user,
            personel: {
              ...state.user?.personel,
              ...action.payload.user.personel,
            },
          };

          if (action.payload.user.personel?.tinggi_badan && action.payload.user.personel?.berat_badan) {
            state.needsOnboarding = false;
          }
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.requiresEmailVerification = false;
        state.verificationEmail = null;
        state.expiresAt = null;
        state.requiresPasswordChange = false;
        state.isFirstLogin = false;
        state.needsOnboarding = true;
      })
      .addCase(markPasswordChangeCompleted.fulfilled, (state) => {
        state.requiresPasswordChange = false;
      })
      .addCase(checkFirstLogin.fulfilled, (state, action) => {
        state.isFirstLogin = action.payload;
      });
  },
});

export const {
  restoreUser,
  updateUserProfileLocal,
  clearError,
  clearEmailVerification,
  setVerificationEmail,
  setRequiresPasswordChange,
  setNeedsOnboarding,
} = authSlice.actions;

export default authSlice.reducer;