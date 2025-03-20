// screens/fitness/WorkoutsScreen.tsx
"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { ArrowLeft, Clock, Flame, Play } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext"; // Menggunakan useTheme hook dari context yang benar
import { getAllWorkouts, Workout } from "../../services/WorkoutService";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../types/navigation";

type WorkoutsScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, "Workout">;
};

export default function WorkoutsScreen({ navigation }: WorkoutsScreenProps) {
  const { theme } = useTheme(); // Menggunakan useTheme hook dari ThemeContext
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const data = await getAllWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => {
    // Get YouTube thumbnail
    const thumbnailUrl = `https://img.youtube.com/vi/${item.video_ketentuan_latihan}/mqdefault.jpg`;
    
    return (
      <TouchableOpacity
        style={[styles.workoutCard, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("WorkoutDetail", { workoutId: item.id })}
      >
        <View style={styles.workoutThumbnail}>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImage} />
          <View style={[styles.playButton, { backgroundColor: `${theme.primary}CC` }]}>
            <Play size={20} color="white" fill="white" />
          </View>
        </View>
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutTitle, { color: theme.text }]}>{item.nama_latihan}</Text>
          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Clock size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                {Math.floor(item.ratarata_waktu_perdetik / 60)} menit
              </Text>
            </View>
            <View style={styles.statItem}>
              <Flame size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                {(
                  parseFloat(item.kalori_ratarata_perdetik) * item.ratarata_waktu_perdetik
                ).toFixed(1)}{" "}
                kcal
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Latihan Tersedia</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Memuat data latihan...
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Tidak ada latihan tersedia
              </Text>
            </View>
          }
        />
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
  list: {
    padding: 16,
  },
  workoutCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  workoutThumbnail: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  workoutInfo: {
    padding: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});