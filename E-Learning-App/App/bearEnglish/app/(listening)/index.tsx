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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../api/index";
import type { Lesson } from "../../types";

export default function ListeningLessons() {
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
      console.log("Fetching listening lessons");
      const response = await API.getLessons("listen");
      console.log("API Response:", response);

      const data = response.data || [];
      console.log("Listening lessons data:", data);
      console.log("Number of listening lessons:", data.length);

      setLessons(data);
    } catch (err) {
      console.error("Failed to fetch listening lessons", err);
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  function renderItem({ item }: { item: Lesson }) {
    const questionCount = (item.questions || []).length;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/[lessonId]",
            params: { lessonId: item._id, lessonTitle: item.name },
          } as any)
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={32} color="#8B5CF6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>
              {item.level && item.topic
                ? `${item.level} • ${item.topic}`
                : item.level || item.topic || ""}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="musical-notes" size={16} color="#8B5CF6" />
            <Text style={styles.metaText}>
              {questionCount} {questionCount === 1 ? "question" : "questions"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8B5CF6" />
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🎧 Listening Practice</Text>
        <Text style={styles.headerSubtitle}>
          Improve your listening skills with audio exercises
        </Text>
      </View>

      {lessons.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="headset-outline" size={64} color="#666" />
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
    backgroundColor: "rgb(38, 39, 48)",
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(38, 39, 48)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#3c3d47",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#4a4b55",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#999",
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(38, 39, 48)",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
