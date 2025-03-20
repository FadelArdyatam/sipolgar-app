export interface User {
  id: number
  name: string
  username: string
  email: string
  status: boolean
  role: string
  created_at: string
  updated_at: string
  personel?: Personel
}

export interface Personel {
  id: number
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: string
  no_hp: string
  jenis_kelamin: string
  jenis_pekerjaan: string | null
  intensitas: string | null
  tinggi_badan: number | null
  berat_badan: number | null
  fitness_goal: string | null
  activity_level: string | null
  id_satuankerja: number
  id_pangkat: number | null
  id_user: number
  created_at: string
  updated_at: string
}

// Create a partial version of Personel for updates
export interface PersonelUpdate {
  name?: string
  email?: string
  no_hp?: string
  tempat_lahir?: string
  tanggal_lahir?: string
  jenis_kelamin?: string
  jenis_pekerjaan?: string | null
  intensitas?: number | null
  tinggi_badan?: number | null
  berat_badan?: number | null
  fitness_goal?: string | null
  activity_level?: string | null
  id_satuankerja?: number
  id_pangkat?: number | null
}

// Add needs_password_change field to UserProfile interface
export interface UserProfile extends User {
  // Additional profile fields can be added here
  isVerified?: boolean
  profileImage?: string
  needs_password_change?: boolean
}

// Update AuthState to include requiresPasswordChange
export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  requiresEmailVerification: boolean
  requiresPasswordChange: boolean // Add this field
  verificationEmail: string | null
  expiresAt: string | null
}

export interface SatuanKerja {
  id: number
  nama_satuan_kerja: string
  parent_id?: number
  level?: string
  maps_url?: string
  latitude?: string
  longitude?: string
  isDeleted?: boolean
  created_at?: string
  updated_at?: string
}

export interface SatuanKerjaParent {
  id: number
  nama_satuan_kerja: string
}

export interface SatuanKerjaChild {
  id: number
  nama_satuan_kerja: string
}

export interface SatuanKerjaResponse {
  message: string
  data: SatuanKerja[] | SatuanKerja
}

export interface SatuanKerjaParentResponse {
  message: string
  data: SatuanKerjaParent[]
}

export interface SatuanKerjaChildResponse {
  message: string
  data: SatuanKerjaChild[]
}

// Update the LoginResponse interface to include needs_password_change
export interface LoginResponse {
  message: string
  user: UserProfile & { needs_password_change?: boolean }
  token: string
  expires_at: string
}

export interface RegisterResponse {
  message: string
  user: {
    name: string
    username: string
    email: string
    role: string
    status: boolean
    updated_at: string
    created_at: string
    id: number
  }
  personel: {
    nama_lengkap: string
    tempat_lahir: string
    tanggal_lahir: string
    no_hp: string
    id_satuankerja: string
    id_user: number
    updated_at: string
    created_at: string
    id: number
  }
}

export interface RegenerateOTPResponse {
  message: string
}

export interface VerifyOTPResponse {
  message: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ChangePasswordResponse {
  message: string
  token?: string
}

export interface UpdateProfileResponse {
  message: string
  user?: UserProfile
}

export interface VerificationStatus {
  is_verified: boolean
  status: boolean
}

