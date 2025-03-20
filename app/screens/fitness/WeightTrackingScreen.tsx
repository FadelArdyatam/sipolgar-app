// screens/fitness/WeightTrackingScreen.tsx
"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { ArrowLeft, Plus, Calendar, TrendingUp } from "lucide-react-native";
import DateTimePicker from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { format } from "date-fns";
import { useTheme } from "../../theme/ThemeContext";
import { getWeightData, saveWeightData, WeightData } from "../../services/WeightTrackingService";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../types/navigation";
import type { RootState } from "../../store";

type WeightTrackingScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, "WeightTracking">;
};

export default function WeightTrackingScreen({ navigation }: WeightTrackingScreenProps) {
  const { theme } = useTheme(); // Menggunakan useTheme hook dari ThemeContext
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [weights, setWeights] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNewWeight, setAddingNewWeight] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    fetchWeightData();
  }, []);

  const fetchWeightData = async () => {
    setLoading(true);
    try {
      const data = await getWeightData();
      // Sort by date
      const sortedData = [...data].sort((a, b) => 
        new Date(a.tgl_berat_badan).getTime() - new Date(b.tgl_berat_badan).getTime()
      );
      setWeights(sortedData);
    } catch (error) {
      console.error("Error fetching weight data:", error);
      Alert.alert("Error", "Gagal mengambil data berat badan");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) {
      Alert.alert("Error", "Masukkan berat badan yang valid");
      return;
    }

    setSavingWeight(true);
    try {
      // Calculate week number (for simplicity, using latest week + 1 or 0 if no data)
      const latestWeek = weights.length > 0 
        ? Math.max(...weights.map(w => w.minggu_ke)) 
        : -1;
      
      const weightData = {
        berat_badan: Number(newWeight),
        minggu_ke: latestWeek + 1,
        tgl_berat_badan: format(selectedDate, "yyyy-MM-dd"),
      };

      await saveWeightData(weightData);
      setAddingNewWeight(false);
      setNewWeight("");
      fetchWeightData(); // Refresh data
      Alert.alert("Sukses", "Data berat badan berhasil disimpan");
    } catch (error) {
      console.error("Error saving weight data:", error);
      Alert.alert("Error", "Gagal menyimpan data berat badan");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderChart = () => {
    if (weights.length < 2) {
      return (
        <View style={styles.noDataContainer}>
          <TrendingUp size={48} color={theme.textSecondary} />
          <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
            Minimal butuh 2 data untuk menampilkan grafik
          </Text>
        </View>
      );
    }

    const chartData = {
      labels: weights.map(w => format(new Date(w.tgl_berat_badan), "dd/MM")),
      datasets: [
        {
          data: weights.map(w => w.berat_badan),
          color: () => theme.primary,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 1,
          color: () => theme.text,
          labelColor: () => theme.textSecondary,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: theme.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Tracking Berat Badan</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Memuat data...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              Berat Badan Saat Ini
            </Text>
            <Text style={[styles.currentWeight, { color: theme.primary }]}>
              {weights.length > 0
                ? `${weights[weights.length - 1].berat_badan} kg`
                : user?.personel?.berat_badan
                  ? `${user.personel.berat_badan} kg`
                  : "Belum ada data"}
            </Text>
            <Text style={[styles.lastUpdate, { color: theme.textSecondary }]}>
              {weights.length > 0
                ? `Terakhir diperbarui: ${format(
                    new Date(weights[weights.length - 1].tgl_berat_badan),
                    "dd MMMM yyyy"
                  )}`
                : "Belum ada data tracking"}
            </Text>
          </View>

          <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Grafik Perubahan Berat Badan
            </Text>
            {renderChart()}
          </View>

          <View style={[styles.historyContainer, { backgroundColor: theme.card }]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: theme.text }]}>
                Riwayat Pencatatan
              </Text>
              <TouchableOpacity
                onPress={() => setAddingNewWeight(true)}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
              >
                <Plus size={16} color="white" />
                <Text style={styles.addButtonText}>Tambah</Text>
              </TouchableOpacity>
            </View>

            {weights.length === 0 ? (
              <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                Belum ada data berat badan
              </Text>
            ) : (
              weights
                .slice()
                .reverse()
                .map((weight, index) => (
                  <View key={index} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.historyDate}>
                      <Calendar size={16} color={theme.textSecondary} />
                      <Text style={[styles.dateText, { color: theme.text }]}>
                        {format(new Date(weight.tgl_berat_badan), "dd MMMM yyyy")}
                      </Text>
                    </View>
                    <Text style={[styles.weightValue, { color: theme.text }]}>
                      {weight.berat_badan} kg
                    </Text>
                  </View>
                ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal untuk menambah berat badan baru */}
      {addingNewWeight && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Tambah Data Berat Badan
            </Text>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Berat Badan (kg)</Text>
            <TextInput
              style={[
                styles.weightInput,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              keyboardType="numeric"
              placeholder="Masukkan berat badan"
              placeholderTextColor={theme.textSecondary}
              value={newWeight}
              onChangeText={setNewWeight}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Tanggal</Text>
            <TouchableOpacity
              style={[
                styles.dateSelector,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: theme.text }}>
                {format(selectedDate, "dd MMMM yyyy")}
              </Text>
              <Calendar size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => {
                  setAddingNewWeight(false);
                  setNewWeight("");
                }}
              >
                <Text style={{ color: theme.text }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveNewWeight}
                disabled={savingWeight}
              >
                {savingWeight ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rightPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  currentWeight: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 12,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  historyContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    marginLeft: 4,
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 8,
  },
  weightValue: {
    fontWeight: "500",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "80%",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  weightInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  dateSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 16,
  },
});