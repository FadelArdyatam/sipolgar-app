import { API_URL } from "../config"
import { logApiCall, logApiResponse, logApiError } from "../api/logger"
import { checkNetworkBeforeCall } from "../api/networkMonitor"
import api from "./ApiClient"

export interface WeightData {
  id?: number
  tgl_berat_badan: string
  berat_badan: number
  minggu_ke: number
  id_personel?: number
  created_at?: string
  updated_at?: string
}

export interface WeightResponse {
  data: WeightData[]
}

export interface SaveWeightResponse {
  message: string
  data: WeightData
}

/**
 * Get weight data for authenticated user
 */
export const getWeightData = async (): Promise<WeightData[]> => {
  try {
    logApiCall("GET", `${API_URL}/berat-badan`)

    // Check network connection
    const isConnected = await checkNetworkBeforeCall()
    if (!isConnected) {
      throw new Error("No internet connection. Please check your network settings.")
    }

    const response = await api.get<WeightResponse>("/berat-badan")
    logApiResponse(`${API_URL}/berat-badan`, response.data)

    return response.data.data || []
  } catch (error) {
    logApiError(`${API_URL}/berat-badan`, error)
    throw error
  }
}

/**
 * Save new weight data for authenticated user
 */
export const saveWeightData = async (data: {
  berat_badan: number
  minggu_ke: number
  tgl_berat_badan: string
}): Promise<WeightData> => {
  try {
    logApiCall("POST", `${API_URL}/berat-badan`, data)

    // Check network connection
    const isConnected = await checkNetworkBeforeCall()
    if (!isConnected) {
      throw new Error("No internet connection. Please check your network settings.")
    }

    const response = await api.post<SaveWeightResponse>("/berat-badan", data)
    logApiResponse(`${API_URL}/berat-badan`, response.data)

    return response.data.data
  } catch (error) {
    logApiError(`${API_URL}/berat-badan`, error)
    throw error
  }
}

