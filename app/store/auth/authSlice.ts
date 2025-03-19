import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../../services/AuthServices";
import type { UserProfile, AuthState, PersonelUpdate } from "../../types/user";

// Update the initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  requiresEmailVerification: false,
  verificationEmail: null,
  expiresAt: null,
  requiresPasswordChange: false,
  isFirstLogin: false,
  needsOnboarding: true, // Add this property
};

// Add a new action to mark password change as completed
export const markPasswordChangeCompleted = createAsyncThunk(
  "auth/markPasswordChangeCompleted",
  async (_, { dispatch }) => {
    await AsyncStorage.setItem("passwordChanged", "true");
    return true;
  }
);

// Add a new action to check if this is the first login
export const checkFirstLogin = createAsyncThunk("auth/checkFirstLogin", async (_, { dispatch }) => {
  const isFirstLogin = await AsyncStorage.getItem("isFirstLogin");
  return isFirstLogin !== "false";
});

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);

      // Store authentication data in AsyncStorage
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

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email: string, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(email);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to send reset email");
  }
});

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

export const getUserProfile = createAsyncThunk("auth/getUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getUserProfile();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to get user profile");
  }
});

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData: { personel?: PersonelUpdate } & Partial<UserProfile>, { rejectWithValue, getState }) => {
    try {
      console.log("Updating profile with data:", JSON.stringify(profileData, null, 2));
      const response = await authService.updateUserProfile(profileData);

      // Get the current state
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;

      // Create a merged user object that includes both the response data and the update data
      const updatedUser = { ...response.user };

      // If we have personel data in the update but not in the response, manually add it
      if (profileData.personel && updatedUser.personel) {
        updatedUser.personel = {
          ...updatedUser.personel,
          ...profileData.personel,
        };
      } else if (profileData.personel && currentUser?.personel && !updatedUser.personel) {
        // If the response doesn't include personel data but we have it in the current state
        updatedUser.personel = {
          ...currentUser.personel,
          ...profileData.personel,
        };
      }

      console.log("Merged user data:", JSON.stringify(updatedUser, null, 2));

      // Update the user data in AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      // Mark onboarding as completed if fitness data is provided
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

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreUser: (state, action: PayloadAction<{ token: string; user: UserProfile; expiresAt?: string }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.expiresAt) {
        state.expiresAt = action.payload.expiresAt;
      }

      // Check if onboarding is needed
      const needsOnboarding =
        !state.user?.personel?.tinggi_badan || !state.user?.personel?.berat_badan;
      state.needsOnboarding = needsOnboarding;
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
          };

          // Update needsOnboarding if fitness data is provided
          if (action.payload.personel.tinggi_badan && action.payload.personel.berat_badan) {
            state.needsOnboarding = false;
          }

          console.log("Updated user data locally:", JSON.stringify(state.user, null, 2));
        } else {
          state.user = {
            ...state.user,
            ...action.payload,
          };
        }

        // Update user data in AsyncStorage
        AsyncStorage.setItem("userData", JSON.stringify(state.user)).catch((error) =>
          console.error("Failed to update user data in AsyncStorage:", error)
        );

        // Mark onboarding as completed if fitness data is provided
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
  },
  extraReducers: (builder) => {
    builder
      // Login
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

        // Check if this is the first login (password needs to be changed)
        const passwordChanged = AsyncStorage.getItem("passwordChanged");
        if (!passwordChanged) {
          state.requiresPasswordChange = true;
          state.isFirstLogin = true;
          AsyncStorage.setItem("isFirstLogin", "true");
        } else {
          state.requiresPasswordChange = false;
          state.isFirstLogin = false;
        }

        // Check if onboarding is needed
        state.needsOnboarding =
          !state.user?.personel?.tinggi_badan || !state.user?.personel?.berat_badan;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      })

      // Register
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

      // Verify OTP
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

      // Check Verification
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

      // Forgot Password
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

      // Regenerate OTP
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

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresPasswordChange = false;
        if (action.payload.token) {
          state.token = action.payload.token;
        }
        AsyncStorage.setItem("passwordChanged", "true");
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to change password";
      })

      // Get User Profile
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

      // Update User Profile
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

          // Update needsOnboarding if fitness data is provided
          if (action.payload.user.personel?.tinggi_badan && action.payload.user.personel?.berat_badan) {
            state.needsOnboarding = false;
          }

          console.log("Updated user in state:", JSON.stringify(state.user, null, 2));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.requiresEmailVerification = false;
        state.verificationEmail = null;
        state.expiresAt = null;
        state.requiresPasswordChange = false;
        state.isFirstLogin = false;
        state.needsOnboarding = true; // Reset onboarding state
      })

      // Mark Password Change Completed
      .addCase(markPasswordChangeCompleted.fulfilled, (state) => {
        state.requiresPasswordChange = false;
      })

      // Check First Login
      .addCase(checkFirstLogin.fulfilled, (state, action) => {
        state.isFirstLogin = action.payload;
      });
  },
});

export const { restoreUser, updateUserProfileLocal, clearError, clearEmailVerification, setVerificationEmail } =
  authSlice.actions;

export default authSlice.reducer;