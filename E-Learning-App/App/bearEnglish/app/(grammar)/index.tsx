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
import { Ionicons } from "@expo/vector-icons";
import { ArrowLeft, BookText } from "lucide-react-native";
import API from "../../api";
import type { Lesson } from "../../types";

export default function GrammarLessons() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching grammar lessons");
      const response = await API.getLessons("grammar");
      console.log("API Response:", response);

      const data = response.data || [];
      console.log("Grammar lessons data:", data);
      console.log("Number of grammar lessons:", data.length);

      setLessons(data);
    } catch (err) {
      console.error("Failed to fetch grammar lessons", err);
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "#4CAF50";
      case "Intermediate":
        return "#FF9800";
      case "Advanced":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  function renderItem({ item }: { item: Lesson }) {
    const questionCount = (item.questions || []).length;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(grammar)/${item._id}` as any)}
      >
        <LinearGradient
          colors={["#2d2d2d", "#3a3a3a"]}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <BookText size={24} color="#F59E0B" />
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={14} color="#ffd700" />
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
          </View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.topic || "Grammar lesson"}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.questionCountText}>
              📝 {questionCount}{" "}
              {questionCount === 1 ? "question" : "questions"}
            </Text>
            <Text style={styles.studyLabel}>Tap to study →</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorState}>
        <Ionicons name="cloud-offline" size={64} color="#666" />
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
        colors={["#F59E0B", "#D97706"]}
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
            <Text style={styles.header}>📝 Grammar Lessons</Text>
            <Text style={styles.headerSubtitle}>
              {lessons.length} lessons available
            </Text>
          </View>
        </View>
      </LinearGradient>

      {lessons.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#666" />
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
    backgroundColor: "#1A1A1B",
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
    backgroundColor: "#1A1A1B",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#a0a0a0",
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1B",
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e0e0e0",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1B",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e0e0e0",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffd700",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e0e0e0",
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionCountText: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
  },
  studyLabel: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
  },
});
