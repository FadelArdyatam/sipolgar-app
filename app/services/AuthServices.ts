import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { logApiCall, logApiResponse, logApiError } from "../api/logger";
import { checkNetworkBeforeCall } from "../api/networkMonitor";
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
} from "../types/user";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    logApiResponse(response.config.url || "", response.data);
    return response;
  },
  (error) => {
    logApiError(error.config?.url || "unknown", error);

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error("Network error. Please check your connection and try again."));
    }

    // Handle API errors with appropriate messages
    const errorMessage = error.response.data?.message || "An unexpected error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

// Add request interceptor to automatically add auth token
api.interceptors.request.use(
  async (config) => {
    logApiCall(config.method?.toUpperCase() || "UNKNOWN", config.url || "", config.data);

    // Check network connection
    const isConnected = await checkNetworkBeforeCall();
    if (!isConnected) {
      throw new Error("No internet connection. Please check your network settings.");
    }

    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login user
export const login = async (
  username: string,
  password: string
): Promise<{ token: string; user: UserProfile; expiresAt: string }> => {
  try {
    const response = await api.post<LoginResponse>("/login", {
      username,
      password,
    });

    console.log("Login response:", JSON.stringify(response.data, null, 2));

    if (response.data.token) {
      // Store token for future authenticated requests
      await AsyncStorage.setItem("userToken", response.data.token);

      // Store user data
      await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));

      // Store expiration time if available
      if (response.data.expires_at) {
        await AsyncStorage.setItem("tokenExpiresAt", response.data.expires_at);
      }

      return {
        token: response.data.token,
        user: response.data.user,
        expiresAt: response.data.expires_at,
      };
    }

    throw new Error("Login failed: No token received");
  } catch (error) {
    throw error;
  }
};

// Register user - updated to match API documentation
export const register = async (userData: {
  nama_lengkap: string;
  username: string;
  email: string;
  no_hp: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  id_satuankerja: number;
  jenis_kelamin?: string;
}): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>("/register", userData);

    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Verify OTP code
export const verifyOTP = async (email: string, otp: string): Promise<VerifyOTPResponse> => {
  try {
    const response = await api.post<VerifyOTPResponse>("/verify-email-otp", {
      email,
      otp_code: otp,
    });

    return response.data;
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
};

// Check verification status
export const checkVerification = async (email: string): Promise<{ is_verified: boolean; status: boolean }> => {
  try {
    const response = await api.post("/check-verification", { email });
    return response.data;
  } catch (error) {
    console.error("Check verification error:", error);
    throw error;
  }
};

// Change password
export const changePassword = async (
  current_password: string,
  new_password: string
): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post<ChangePasswordResponse>("/change-password", {
      current_password,
      new_password,
    });

    // If a new token is returned, update it in storage
    if (response.data.token) {
      await AsyncStorage.setItem("userToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>("/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

// Regenerate OTP
export const regenerateOTP = async (email: string): Promise<RegenerateOTPResponse> => {
  try {
    const response = await api.post<RegenerateOTPResponse>("/regenerate-otp", { email });
    console.log("Regenerate OTP response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Regenerate OTP error:", error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get("/users");
    return response.data.user;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: { personel?: PersonelUpdate } & Partial<UserProfile>): Promise<UpdateProfileResponse> => {
  try {
    console.log("Updating user profile with data:", JSON.stringify(profileData, null, 2));

    // Get current user data from AsyncStorage to merge with the response
    const userData = await AsyncStorage.getItem("userData");
    const currentUser = userData ? JSON.parse(userData) : null;

    // Perbaikan: Format data sesuai dengan yang diharapkan API
    let apiPayload;
    if (profileData.personel) {
      // Jika ada data personel, kirim data personel langsung (bukan sebagai sub-objek)
      apiPayload = {
        ...profileData.personel
      };
    } else {
      // Jika tidak ada data personel, kirim data user saja
      apiPayload = { ...profileData };
    }

    console.log("API payload formatted:", JSON.stringify(apiPayload, null, 2));
    const response = await api.post<UpdateProfileResponse>("/users/update", apiPayload);

    console.log("Update profile response:", JSON.stringify(response.data, null, 2));

    // Perbarui data respons dengan data yang baru diupdate
    if (response.data.user) {
      // Jika ada personel data yang kita kirim, tapi tidak dikembalikan dalam respons
      if (profileData.personel && response.data.user) {
        if (!response.data.user.personel) {
          response.data.user.personel = {
            ...profileData.personel
          };
        }
        
        // Pastikan data yang dikirim tercermin dalam respons
        response.data.user.personel = {
          ...response.data.user.personel,
          ...profileData.personel
        };
      }

      // Update stored user data
      await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
      
      // Jika fitness data disediakan, tandai onboarding sebagai selesai
      if (profileData.personel?.tinggi_badan && profileData.personel?.berat_badan) {
        await AsyncStorage.setItem("onboardingCompleted", "true");
        console.log("Onboarding flag set to true in updateUserProfile API call");
      }
    }

    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

// Update fitness data (dedicated function for updating height, weight, goals)
export const updateFitnessData = async (
  fitnessData: {
    tinggi_badan: number;
    berat_badan: number;
    fitness_goal: string;
    activity_level: string;
  }
): Promise<UpdateProfileResponse> => {
  try {
    console.log("Updating fitness data:", JSON.stringify(fitnessData, null, 2));
    
    // Kirim langsung ke API tanpa nesting dalam personel
    const response = await api.post<UpdateProfileResponse>("/users/update", fitnessData);
    
    console.log("Update fitness response:", JSON.stringify(response.data, null, 2));
    
    // Perbarui data user di AsyncStorage
    const userData = await AsyncStorage.getItem("userData");
    if (userData && response.data.user) {
      const currentUser = JSON.parse(userData);
      
      // Perbarui data personel
      if (!currentUser.personel) {
        currentUser.personel = {};
      }
      
      currentUser.personel = {
        ...currentUser.personel,
        ...fitnessData
      };
      
      // Simpan kembali ke AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(currentUser));
      
      // Tandai onboarding selesai
      await AsyncStorage.setItem("onboardingCompleted", "true");
      console.log("Onboarding completed flag set in updateFitnessData");
    }
    
    return response.data;
  } catch (error) {
    console.error("Update fitness data error:", error);
    throw error;
  }
};

// Get parent satuan kerja - with retry mechanism
export const getParentSatuanKerja = async (retryCount = 0): Promise<SatuanKerjaParent[]> => {
  try {
    console.log("Fetching parent satuan kerja");
    const response = await api.get("/satuan-kerja/parents");
    console.log("Parent satuan kerja response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch parent satuan kerja:", error);

    // Add retry logic (max 2 retries)
    if (retryCount < 2) {
      console.log(`Retrying getParentSatuanKerja (attempt ${retryCount + 1})`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return getParentSatuanKerja(retryCount + 1);
    }

    return [];
  }
};

// Get child satuan kerja by parent ID - with retry mechanism
export const getChildSatuanKerja = async (parentId: number, retryCount = 0): Promise<SatuanKerjaChild[]> => {
  try {
    console.log(`Fetching child satuan kerja for parent ID: ${parentId}`);
    const response = await api.get(`/satuan-kerja/children/${parentId}`);
    console.log("Child satuan kerja response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch child satuan kerja for parent ID ${parentId}:`, error);

    // Add retry logic (max 2 retries)
    if (retryCount < 2) {
      console.log(`Retrying getChildSatuanKerja (attempt ${retryCount + 1})`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return getChildSatuanKerja(parentId, retryCount + 1);
    }

    return [];
  }
};

// Get satuan kerja detail by ID
export const getSatuanKerjaDetail = async (id: number): Promise<SatuanKerja | null> => {
  try {
    const response = await api.get(`/satuan-kerja/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error(`Failed to fetch satuan kerja detail for ID ${id}:`, error);
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Clear local storage
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("tokenExpiresAt");
    await AsyncStorage.removeItem("onboardingCompleted");
    await AsyncStorage.removeItem("passwordChanged");
    await AsyncStorage.removeItem("isFirstLogin");
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear storage even if API call fails
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("tokenExpiresAt");
    await AsyncStorage.removeItem("onboardingCompleted");
    await AsyncStorage.removeItem("passwordChanged");
    await AsyncStorage.removeItem("isFirstLogin");
  }
};