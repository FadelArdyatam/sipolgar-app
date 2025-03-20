// services/WorkoutService.ts
import { api } from "./AuthServices";

export type Workout = {
  id: number;
  nama_latihan: string;
  ratarata_waktu_perdetik: number;
  kalori_ratarata_perdetik: string;
  video_ketentuan_latihan: string;
  deskripsi_ketentuan_latihan: string;
  tgl_post_ketentuan_latihan: string;
  isDeleted?: boolean;
  created_at?: string;
  updated_at?: string;
};

// Ambil semua data latihan
export const getAllWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await api.get('/latihan');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch workout data:', error);
    throw error;
  }
};

// Ambil detail latihan berdasarkan ID
export const getWorkoutDetail = async (id: number): Promise<Workout> => {
  try {
    const response = await api.get(`/latihan/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch workout detail for ID ${id}:`, error);
    throw error;
  }
};