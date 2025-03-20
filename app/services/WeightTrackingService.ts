// services/WeightTrackingService.ts
import axios from "axios";
import { api } from "./AuthServices";


export type WeightData = {
  id?: number;
  tgl_berat_badan: string;
  berat_badan: number;
  minggu_ke: number;
  id_personel?: number;
  created_at?: string;
  updated_at?: string;
};

// Ambil data berat badan
export const getWeightData = async (): Promise<WeightData[]> => {
  try {
    const response = await api.get('/berat-badan');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch weight data:', error);
    throw error;
  }
};

// Simpan data berat badan baru
// services/WeightTrackingService.ts
export const saveWeightData = async (data: {
  berat_badan: number;
  minggu_ke: number;
  tgl_berat_badan: string;
}): Promise<WeightData> => {
  try {
    // Pastikan minggu_ke minimal 1
    const dataToSend = {
      ...data,
      minggu_ke: Math.max(1, data.minggu_ke) // Pastikan minimal 1
    };
    
    const response = await api.post('/berat-badan', dataToSend);
    return response.data.data;
  } catch (error) {
    console.error('Failed to save weight data:', error);
    throw error;
  }
};