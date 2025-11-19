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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BookOpen, ArrowLeft } from "lucide-react-native";
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
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <BookOpen size={24} color="#EC4899" />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.lessonName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.lessonTopic}>{item.topic}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.levelBadge,
            { backgroundColor: getLevelColor(item.level as any) + "20" },
          ]}
        >
          <Text
            style={[
              styles.levelText,
              { color: getLevelColor(item.level as any) },
            ]}
          >
            {item.level}
          </Text>
        </View>
        <Text style={styles.questionCount}>
          {item.questions?.length || 0} questions
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Loading reading lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)")}
        >
          <ArrowLeft size={24} color="#EC4899" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Reading Lessons</Text>
          <Text style={styles.headerSubtitle}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} available
          </Text>
        </View>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e0e0e0",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  lessonCard: {
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgb(60, 62, 75)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EC489920",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e0e0e0",
    marginBottom: 4,
  },
  lessonTopic: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  questionCount: {
    fontSize: 12,
    color: "#808080",
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
