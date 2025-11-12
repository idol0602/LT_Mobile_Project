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
import { API_BASE } from "../../constants/api";

type Lesson = {
  _id: string;
  name: string;
  level?: string;
  topic?: string;
  type?: string;
  vocabularies?: any[];
  readingContent?: string;
  questions?: any[];
  createdAt?: string;
  updatedAt?: string;
};

export default function VocabularyLessons() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    try {
      setLoading(true);
      console.log("Fetching lessons from:", `${API_BASE}/api/lessons`);
      const res = await fetch(`${API_BASE}/api/lessons`);
      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      console.log("API Response:", json);

      // controller returns { data: lessons, ... }
      const data = json.data || json;
      console.log("Parsed lessons data:", data);

      // Filter only vocabulary lessons (type: "vocab")
      const vocabLessons = (data || []).filter(
        (lesson: Lesson) => lesson.type === "vocab"
      );
      console.log("Filtered vocab lessons:", vocabLessons);
      console.log("Number of vocab lessons:", vocabLessons.length);

      setLessons(vocabLessons);
    } catch (err) {
      console.error("Failed to fetch lessons", err);
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
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vocabulary Lessons</Text>

      {lessons.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No lessons found</Text>
          <Text style={styles.debugText}>API: {API_BASE}/api/lessons</Text>
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
