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
export const saveWeightData = async (data: {
  berat_badan: number;
  minggu_ke: number;
  tgl_berat_badan: string;
}): Promise<WeightData> => {
  try {
    const response = await api.post('/berat-badan', data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to save weight data:', error);
    throw error;
  }
};