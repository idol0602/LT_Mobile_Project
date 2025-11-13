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
import API from "../../api/index";
import type { Lesson } from "../../types";

export default function VocabularyLessons() {
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
      console.log("Fetching vocabulary lessons");
      const response = await API.getLessons("vocab");
      console.log("API Response:", response);

      // API getLessons returns { data: lessons, pagination }
      const data = response.data || [];
      console.log("Vocabulary lessons data:", data);
      console.log("Number of vocabulary lessons:", data.length);

      setLessons(data);
    } catch (err) {
      console.error("Failed to fetch vocabulary lessons", err);
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  function renderItem({ item }: { item: Lesson }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(vocabularies)/[lessonId]",
            params: { lessonId: item._id, lessonTitle: item.name },
          })
        }
      >
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>
          {item.level && item.topic
            ? `${item.level} • ${item.topic}`
            : item.level || item.topic || ""}
        </Text>
        <Text style={styles.meta}>
          {(item.vocabularies || []).length} words • {item.type || "lesson"}
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4A90E2" />
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
      <Text style={styles.header}>Vocabulary Lessons</Text>

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
  container: { flex: 1, backgroundColor: "rgb(38, 39, 48)" },
  header: {
    fontSize: 24,
    fontWeight: "700",
    padding: 20,
    color: "#fff",
    textAlign: "center",
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
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#4a4b55",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    color: "#4A90E2",
    fontSize: 12,
    fontWeight: "500",
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
    backgroundColor: "rgb(38, 39, 48)",
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
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
