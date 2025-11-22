"use client";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Provider } from "react-native-paper";
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../api";

const { width } = Dimensions.get("window");

const VocabularyIcon = ({ size = 50 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <LinearGradient id="vocabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1E40AF" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M20 15C20 12.2386 22.2386 10 25 10H75C77.7614 10 80 12.2386 80 15V85C80 87.7614 77.7614 90 75 90H25C22.2386 90 20 87.7614 20 85V15Z"
      fill="url(#vocabGrad)"
    />
    <Path
      d="M30 25H70M30 40H70M30 55H70M30 70H70"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

const ListeningIcon = ({ size = 50 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <LinearGradient id="listeningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
        <Stop offset="100%" stopColor="#6D28D9" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Circle cx="50" cy="50" r="35" fill="url(#listeningGrad)" />
    <Path
      d="M35 50C35 41.7157 41.7157 35 50 35C58.2843 35 65 41.7157 65 50"
      stroke="white"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <Circle cx="50" cy="50" r="8" fill="white" />
    <Path
      d="M25 50C25 35.6406 36.6406 24 51 24"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.6"
    />
  </Svg>
);

const ReadingIcon = ({ size = 50 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <LinearGradient id="readingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EC4899" stopOpacity="1" />
        <Stop offset="100%" stopColor="#BE185D" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M50 15C50 15 30 25 30 50C30 75 50 85 50 85C50 85 70 75 70 50C70 25 50 15 50 15Z"
      fill="url(#readingGrad)"
    />
    <Path
      d="M40 45L48 55L60 40"
      stroke="white"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GrammarIcon = ({ size = 50 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Defs>
      <LinearGradient id="grammarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
        <Stop offset="100%" stopColor="#D97706" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path d="M20 20H80V80H20Z" fill="url(#grammarGrad)" />
    <Path
      d="M30 35H70M30 50H70M30 65H70"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Circle cx="75" cy="30" r="8" fill="white" />
  </Svg>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tipsViewAll, setTipsViewAll] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [currentLessonName, setCurrentLessonName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch user progress
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchUserProgress();
    }
  }, [isAuthenticated, user?._id]);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const response = await API.getUserProgress(user!._id as any);
      if (response.success) {
        setProgressData(response.data);
        console.log("User progress loaded:", response.data);

        // Fetch lesson name if currentLesson exists
        if (response.data?.currentLesson?.lessonId) {
          fetchLessonName(response.data.currentLesson.lessonId);
        }
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonName = async (lessonId: string) => {
    try {
      const response = await API.getLessonById(lessonId);
      if (response.data?.name) {
        setCurrentLessonName(response.data.name);
      }
    } catch (error) {
      console.error("Error fetching lesson name:", error);
      setCurrentLessonName(`Lesson ${lessonId.slice(-6)}`);
    }
  };

  const handleNavigateToCurrentLesson = () => {
    if (
      !progressData?.currentLesson?.lessonId ||
      !progressData?.currentLesson?.category
    ) {
      return;
    }

    const { lessonId, category } = progressData.currentLesson;

    // Navigate based on category
    switch (category) {
      case "reading":
        router.push(`/(reading)/${lessonId}` as any);
        break;
      case "vocab":
        router.push({
          pathname: "/(vocabularies)/VocabularyStudy",
          params: { lessonId, lessonName: currentLessonName || "Vocabulary" },
        } as any);
        break;
      case "listening":
        router.push({
          pathname: "/(listening)/[lessonId]",
          params: { lessonId, lessonTitle: currentLessonName || "Listening" },
        } as any);
        break;
      case "grammar":
        // TODO: Add grammar route when ready
        console.log("Grammar lessons coming soon!");
        break;
      default:
        console.warn("Unknown category:", category);
    }
  };

  const tipsData = [
    {
      id: 1,
      title: "Daily Vocabulary",
      description: "Learn 5 new words every day",
      image: require("../../assets/images/learning-tip.jpg"),
    },
    {
      id: 2,
      title: "Listen & Repeat",
      description: "Practice pronunciation with native speakers",
      image: require("../../assets/images/learning-tip2.jpg"),
    },
    {
      id: 3,
      title: "Read Stories",
      description: "Improve reading comprehension",
      image: require("../../assets/images/learning-tip3.jpg"),
    },
    {
      id: 4,
      title: "Grammar Rules",
      description: "Master English grammar basics",
      image: require("../../assets/images/learning-tip4.jpg"),
    },
  ];

  return (
    <Provider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.time}></Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatIcon}>📚</Text>
              <Text style={styles.headerStatText}>
                {progressData
                  ? (progressData.reading?.data?.length || 0) +
                    (progressData.vocab?.data?.length || 0) +
                    (progressData.listening?.data?.length || 0) +
                    (progressData.grammar?.data?.length || 0)
                  : 0}
              </Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatIcon}>🔥</Text>
              <Text style={styles.headerStatText}>
                {progressData?.streak || 0}
              </Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatIcon}>🔔</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>
              Hello, {user?.fullName || user?.name || "User"}! 🤍🐻‍❄️
            </Text>
            <Text style={styles.greetingSubtext}>Ready to learn today?</Text>
          </View>

          {/* Active Level Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Level</Text>
              {/* <TouchableOpacity>
                <Text style={styles.seeAll}>See Course</Text>
              </TouchableOpacity> */}
            </View>

            <TouchableOpacity
              style={styles.activeCard}
              onPress={handleNavigateToCurrentLesson}
              disabled={!progressData?.currentLesson?.lessonId}
            >
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>
                    {progressData?.currentLesson?.category
                      ? progressData[progressData.currentLesson.category]
                          ?.completedPercent || 0
                      : 0}
                    %
                  </Text>
                </View>
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseChapter}>
                  {progressData?.currentLesson?.category
                    ? progressData.currentLesson.category
                        .charAt(0)
                        .toUpperCase() +
                      progressData.currentLesson.category.slice(1)
                    : "Start Learning"}
                </Text>
                <Text style={styles.courseTitle}>
                  {currentLessonName || "Begin Your Journey"}
                </Text>
                <Text style={styles.courseSubtitle}>
                  {progressData?.currentLesson?.category
                    ? `${
                        progressData[progressData.currentLesson.category]?.data
                          ?.length || 0
                      } lessons completed`
                    : "Continue your journey!"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleNavigateToCurrentLesson}
              disabled={!progressData?.currentLesson?.lessonId}
            >
              <Text style={styles.continueButtonText}>Continue Studying</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tips to Learning English</Text>
              <TouchableOpacity onPress={() => setTipsViewAll(!tipsViewAll)}>
                <Text style={styles.seeAll}>
                  {tipsViewAll ? "View Less" : "View All"}
                </Text>
              </TouchableOpacity>
            </View>

            {tipsViewAll ? (
              <View style={styles.tipsVerticalList}>
                {tipsData.map((tip) => (
                  <TouchableOpacity
                    key={tip.id}
                    style={styles.tipCardVertical}
                    onPress={() =>
                      router.push({
                        pathname: "/TipDetailScreen",
                        params: {
                          id: tip.id,
                          title: tip.title,
                          description: tip.description,
                        },
                      })
                    }
                  >
                    <Image source={tip.image} style={styles.tipImageVertical} />
                    <View style={styles.tipContentVertical}>
                      <Text style={styles.tipTitleVertical}>{tip.title}</Text>
                      <Text style={styles.tipDescriptionVertical}>
                        {tip.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tipsHorizontalScroll}
              >
                {tipsData.map((tip) => (
                  <TouchableOpacity
                    key={tip.id}
                    style={styles.tipCardHorizontal}
                    onPress={() =>
                      router.push({
                        pathname: "/TipDetailScreen",
                        params: {
                          id: tip.id,
                          title: tip.title,
                          description: tip.description,
                        },
                      })
                    }
                  >
                    <Image
                      source={tip.image}
                      style={styles.tipImageHorizontal}
                    />
                    <View style={styles.tipContentHorizontal}>
                      <Text style={styles.tipTitleHorizontal}>{tip.title}</Text>
                      <Text style={styles.tipDescriptionHorizontal}>
                        {tip.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* 4 Main Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Modules</Text>
            <View style={styles.modulesGrid}>
              <TouchableOpacity
                style={styles.moduleCard}
                onPress={() =>
                  router.push({ pathname: "/(vocabularies)" } as any)
                }
              >
                <View style={styles.iconContainer}>
                  <VocabularyIcon size={50} />
                </View>
                <Text style={styles.moduleTitle}>Vocabulary</Text>
                <Text style={styles.moduleSubtitle}>Learn new words</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleCard}
                onPress={() => router.push({ pathname: "/(listening)" } as any)}
              >
                <View style={styles.iconContainer}>
                  <ListeningIcon size={50} />
                </View>
                <Text style={styles.moduleTitle}>Listening</Text>
                <Text style={styles.moduleSubtitle}>Improve hearing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleCard}
                onPress={() => router.push("/(reading)" as any)}
              >
                <View style={styles.iconContainer}>
                  <ReadingIcon size={50} />
                </View>
                <Text style={styles.moduleTitle}>Reading</Text>
                <Text style={styles.moduleSubtitle}>Read & understand</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleCard}
                onPress={() => router.push("/(grammar)" as any)}
              >
                <View style={styles.iconContainer}>
                  <GrammarIcon size={50} />
                </View>
                <Text style={styles.moduleTitle}>Grammar</Text>
                <Text style={styles.moduleSubtitle}>Master grammar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "rgb(38, 39, 48)",
  },
  headerLeft: {
    flex: 1,
  },
  time: {
    color: "#e0e0e0",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  headerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerStatIcon: {
    fontSize: 16,
  },
  headerStatText: {
    color: "#e0e0e0",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    paddingVertical: 20,
    color: "#e0e0e0",
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: "#64B5F6",
    fontSize: 14,
    fontWeight: "600",
  },
  activeCard: {
    flexDirection: "row",
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  progressCircleContainer: {
    marginRight: 16,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "rgb(60, 62, 75)",
  },
  progressText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  courseInfo: {
    flex: 1,
  },
  courseChapter: {
    color: "#a0a0a0",
    fontSize: 12,
    fontWeight: "600",
  },
  courseTitle: {
    color: "#e0e0e0",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  courseSubtitle: {
    color: "#808080",
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: "#2196F3",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  challengesGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  challengeCard: {
    flex: 1,
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  challengeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  challengeTitle: {
    color: "#e0e0e0",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  challengeSubtitle: {
    color: "#a0a0a0",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  challengeDesc: {
    color: "#808080",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  challengeButton: {
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  challengeButtonText: {
    color: "#64B5F6",
    fontSize: 12,
    fontWeight: "600",
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moduleCard: {
    width: (width - 48) / 2,
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleTitle: {
    color: "#e0e0e0",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  moduleSubtitle: {
    color: "#808080",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgb(50, 52, 65)",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgb(60, 62, 75)",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navIcon: {
    fontSize: 24,
  },
  bottomPadding: {
    height: 90,
  },
  greetingSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  greetingText: {
    color: "#e0e0e0",
    fontSize: 24,
    fontWeight: "700",
  },
  greetingSubtext: {
    color: "#a0a0a0",
    fontSize: 14,
    marginTop: 4,
  },
  tipsHorizontalScroll: {
    marginBottom: 16,
  },
  tipCardHorizontal: {
    width: 280,
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  tipImageHorizontal: {
    width: "100%",
    height: 160,
    backgroundColor: "rgb(60, 62, 75)",
  },
  tipContentHorizontal: {
    padding: 12,
  },
  tipTitleHorizontal: {
    color: "#e0e0e0",
    fontSize: 14,
    fontWeight: "700",
  },
  tipDescriptionHorizontal: {
    color: "#a0a0a0",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  tipsVerticalList: {
    gap: 12,
    marginBottom: 16,
  },
  tipCardVertical: {
    flexDirection: "row",
    backgroundColor: "rgb(50, 52, 65)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  tipImageVertical: {
    width: 120,
    height: 120,
    backgroundColor: "rgb(60, 62, 75)",
  },
  tipContentVertical: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  tipTitleVertical: {
    color: "#e0e0e0",
    fontSize: 14,
    fontWeight: "700",
  },
  tipDescriptionVertical: {
    color: "#a0a0a0",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
