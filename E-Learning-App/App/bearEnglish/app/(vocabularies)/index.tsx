"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ArrowLeft, BookOpen, Star } from "lucide-react-native";
import API from "../../api/index";
import type { Lesson } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

export default function VocabularyLessons() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedPercent, setCompletedPercent] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (user?._id) {
        fetchLessons();
      }
    }, [user])
  );

  async function fetchLessons() {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching vocabulary lessons");
      const response = await API.getLessons("vocab");
      console.log("API Response:", response);

      // API getLessons returns { data: lessons, pagination }
      const data = response.data || [];
      console.log("Vocabulary lessons data:", data);
      console.log("Number of vocabulary lessons:", data.length);

      setLessons(data);

      // Fetch progress if user is logged in
      if (user?._id) {
        try {
          const progressResponse = await API.getUserProgress(user._id as any);
          if (progressResponse.success && progressResponse.data?.vocab) {
            setCompletedPercent(
              progressResponse.data.vocab.completedPercent || 0
            );
            setCompletedLessons(progressResponse.data.vocab.data || []);
            console.log(
              "Vocabulary progress:",
              progressResponse.data.vocab.completedPercent
            );
          }
        } catch (err) {
          console.error("Error fetching progress:", err);
        }
      }
    } catch (err) {
      console.error("Failed to fetch vocabulary lessons", err);
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  function renderItem({ item }: { item: Lesson }) {
    const isCompleted = completedLessons.includes(item._id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(vocabularies)/[lessonId]",
            params: {
              lessonId: item._id,
              lessonTitle: item.name,
            },
          })
        }
      >
        <LinearGradient
          colors={isCompleted ? ["#1a5f3f", "#2d7a4f"] : ["#2d2d2d", "#3a3a3a"]}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <BookOpen size={24} color="#3B82F6" />
            </View>
            <View style={styles.cardRightHeader}>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
              <View style={styles.levelBadge}>
                <Star size={14} color="#ffd700" />
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>
            {item.topic || "Vocabulary lesson"}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.wordCount}>
              📝 {item.vocabularies?.length || 0} words
            </Text>
            <Text style={styles.studyLabel}>
              {isCompleted ? "Review →" : "Tap to study →"}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorText}>Connection Error</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLessons}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#1E40AF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)")}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>📚 Vocabulary Lessons</Text>
            <Text style={styles.headerSubtitle}>
              {lessons.length} lessons available
            </Text>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>
                  {completedPercent.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${completedPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {lessons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No lessons found</Text>
          <Text style={styles.emptySubtext}>
            Try refreshing or check your connection
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLessons}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.5)",
    padding: 12,
    borderRadius: 12,
  },
  cardRightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b8860b",
    marginLeft: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    color: "#a0a0a0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  studyLabel: {
    fontSize: 12,
    color: "#3B82F6",
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  errorSubtext: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  debugText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
});
