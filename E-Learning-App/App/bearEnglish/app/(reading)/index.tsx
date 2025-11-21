import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BookOpen, ArrowLeft, Star } from "lucide-react-native";
import API from "../../api";
import type { Lesson } from "../../types";

export default function ReadingScreen() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadingLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching reading lessons...");
      const response = await API.getLessons("reading");
      console.log("Reading lessons response:", response);
      setLessons(response.data || []);
    } catch (error) {
      console.error("Error fetching reading lessons:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to load reading lessons";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadingLessons();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReadingLessons();
  }, []);

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

  const renderLessonCard = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => {
        console.log("Opening lesson:", item._id);
        router.push(`/(reading)/${item._id}` as any);
      }}
    >
      <LinearGradient
        colors={["#2d2d2d", "#3a3a3a"]}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <BookOpen size={24} color="#EC4899" />
          </View>
          <View style={styles.levelBadge}>
            <Star size={14} color="#ffd700" />
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <Text style={styles.lessonName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.lessonTopic}>{item.topic || "Reading lesson"}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.questionCount}>
            📖 {item.questions?.length || 0} questions
          </Text>
          <Text style={styles.studyLabel}>Tap to study →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Loading reading lessons...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <BookOpen size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Không thể tải bài học</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchReadingLessons}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#EC4899", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)")}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>📚 Reading Lessons</Text>
            <Text style={styles.headerSubtitle}>
              {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} available
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={lessons}
        renderItem={renderLessonCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookOpen size={64} color="#808080" />
            <Text style={styles.emptyText}>No reading lessons yet</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new content
            </Text>
          </View>
        }
      />
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
  header: {
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
  headerTitle: {
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  lessonCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: "#EC4899",
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
    backgroundColor: "rgba(236,72,153,0.2)",
    padding: 12,
    borderRadius: 12,
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
  lessonName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  lessonTopic: {
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
  questionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EC4899",
  },
  studyLabel: {
    fontSize: 12,
    color: "#808080",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#a0a0a0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e0e0e0",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#808080",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e0e0e0",
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#EC4899",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
