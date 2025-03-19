import { API_URL } from "../config"
import { logApiCall, logApiResponse, logApiError } from "../api/logger"
import { checkNetworkBeforeCall } from "../api/networkMonitor"
import api from "./ApiClient"

export interface WorkoutData {
  id: number
  nama_latihan: string
  ratarata_waktu_perdetik: number
  kalori_ratarata_perdetik: string
  video_ketentuan_latihan: string
  deskripsi_ketentuan_latihan: string
  tgl_post_ketentuan_latihan: string
  isDeleted?: boolean
  created_at?: string
  updated_at?: string
}

export interface WorkoutResponse {
  message: string
  data: WorkoutData[]
}

export interface WorkoutDetailResponse {
  message: string
  data: WorkoutData
}

/**
 * Get all workout data
 */
export const getAllWorkouts = async (): Promise<WorkoutData[]> => {
  try {
    logApiCall("GET", `${API_URL}/latihan`)

    // Check network connection
    const isConnected = await checkNetworkBeforeCall()
    if (!isConnected) {
      throw new Error("No internet connection. Please check your network settings.")
    }

    const response = await api.get<WorkoutResponse>("/latihan")
    logApiResponse(`${API_URL}/latihan`, response.data)

    return response.data.data || []
  } catch (error) {
    logApiError(`${API_URL}/latihan`, error)
    throw error
  }
}

/**
 * Get specific workout detail
 */
export const getWorkoutDetail = async (id: number): Promise<WorkoutData> => {
  try {
    logApiCall("GET", `${API_URL}/latihan/${id}`)

    // Check network connection
    const isConnected = await checkNetworkBeforeCall()
    if (!isConnected) {
      throw new Error("No internet connection. Please check your network settings.")
    }

    const response = await api.get<WorkoutDetailResponse>(`/latihan/${id}`)
    logApiResponse(`${API_URL}/latihan/${id}`, response.data)

    return response.data.data
  } catch (error) {
    logApiError(`${API_URL}/latihan/${id}`, error)
    throw error
  }
}

