import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Home, RotateCcw, Trophy, Star } from "lucide-react-native";
import { Audio } from "expo-av";
import { useAchievementContext } from "../../contexts/AchievementContext";

// Confetti Animation Component
const AnimatedConfetti = () => {
  const [confettiPieces] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      animation: new Animated.Value(0),
      x: Math.random() * Dimensions.get("window").width,
      color: ["#F59E0B", "#D97706", "#FCD34D", "#FDE047", "#FACC15", "#EAB308"][
        Math.floor(Math.random() * 6)
      ],
      size: Math.random() * 8 + 4,
    }))
  );

  useEffect(() => {
    const animations = confettiPieces.map((piece) =>
      Animated.timing(piece.animation, {
        toValue: 1,
        duration: 4000 + Math.random() * 2000,
        useNativeDriver: true,
      })
    );

    Animated.stagger(80, animations).start();
  }, []);

  return (
    <View style={styles.confettiContainer}>
      {confettiPieces.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confettiPiece,
            {
              left: piece.x,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [
                {
                  translateY: piece.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, Dimensions.get("window").height + 100],
                  }),
                },
                {
                  rotate: piece.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "720deg"],
                  }),
                },
                {
                  scale: piece.animation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0.8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function GrammarResults() {
  const router = useRouter();
  const { lessonId, lessonName, score, correct, total, achievements } =
    useLocalSearchParams<{
      lessonId: string;
      lessonName: string;
      score: string;
      correct: string;
      total: string;
      achievements?: string;
    }>();
  const { setAchievementQueue } = useAchievementContext();

  const [soundEffect, setSoundEffect] = useState<Audio.Sound | null>(null);
  const [scaleAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));

  const scorePercentage = parseInt(score || "0");
  const correctAnswers = parseInt(correct || "0");
  const totalQuestions = parseInt(total || "0");

  useEffect(() => {
    // Play celebration sound
    playCelebrationSound();

    // Animate elements
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Check for achievements and navigate after showing results
    if (achievements) {
      try {
        const achievementsData = JSON.parse(achievements);
        if (achievementsData && achievementsData.length > 0) {
          console.log("🎉 Achievements received in results:", achievementsData);

          // Queue remaining achievements (all except first)
          if (achievementsData.length > 1) {
            setAchievementQueue(achievementsData.slice(1));
          }

          // Navigate to achievement page after 2 seconds (show results first)
          setTimeout(() => {
            router.push({
              pathname: "/(achievements)/achievement-unlocked",
              params: {
                achievement: JSON.stringify(achievementsData[0]),
              },
            });
          }, 2000);
        }
      } catch (error) {
        console.error("Error parsing achievements:", error);
      }
    }

    return () => {
      if (soundEffect) {
        soundEffect.unloadAsync();
      }
    };
  }, [achievements]);

  const playCelebrationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/winning.mp3"),
        { shouldPlay: true }
      );
      setSoundEffect(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setSoundEffect(null);
        }
      });
    } catch (error) {
      console.error("Error playing celebration sound:", error);
    }
  };

  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) {
      return {
        title: "🌟 Excellent! 🌟",
        message: "Outstanding grammar mastery!",
        color: "#F59E0B",
      };
    } else if (scorePercentage >= 70) {
      return {
        title: "👏 Great Job! 👏",
        message: "Good understanding of grammar!",
        color: "#10B981",
      };
    } else if (scorePercentage >= 50) {
      return {
        title: "👍 Not Bad! 👍",
        message: "Keep practicing to improve!",
        color: "#F59E0B",
      };
    } else {
      return {
        title: "💪 Keep Trying! 💪",
        message: "Practice makes perfect!",
        color: "#EF4444",
      };
    }
  };

  const performance = getPerformanceMessage();

  const handleRetry = () => {
    router.push(`/(grammar)/${lessonId}` as any);
  };

  const handleGoHome = () => {
    router.push("/(tabs)" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedConfetti />

      <View style={styles.content}>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Grammar Lesson Complete!</Text>
            <Text style={styles.lessonName}>{lessonName}</Text>
          </View>

          {/* Score Display */}
          <Animated.View
            style={[
              styles.scoreContainer,
              {
                transform: [{ scale: scaleAnimation }],
              },
            ]}
          >
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              style={styles.scoreCard}
            >
              <Trophy size={48} color="#fff" style={styles.trophyIcon} />
              <Text style={styles.scorePercentage}>{scorePercentage}%</Text>
              <Text style={styles.scoreDetail}>
                {correctAnswers} out of {totalQuestions} correct
              </Text>

              {/* Star rating */}
              <View style={styles.starContainer}>
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    color={scorePercentage >= star * 33 ? "#FCD34D" : "#6B7280"}
                    fill={
                      scorePercentage >= star * 33 ? "#FCD34D" : "transparent"
                    }
                  />
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Performance Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnimation,
              },
            ]}
          >
            <Text
              style={[styles.performanceTitle, { color: performance.color }]}
            >
              {performance.title}
            </Text>
            <Text style={styles.performanceMessage}>{performance.message}</Text>
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Additional Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnimation,
              },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {totalQuestions - correctAnswers}
              </Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnimation,
              },
            ]}
          >
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <RotateCcw size={20} color="#F59E0B" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
              <Home size={20} color="#fff" />
              <Text style={styles.homeButtonText}>Go Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 8,
  },
  lessonName: {
    fontSize: 18,
    color: "#a0a0a0",
    textAlign: "center",
  },
  scoreContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  scoreCard: {
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  trophyIcon: {
    marginBottom: 16,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  scoreDetail: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: "row",
    gap: 8,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  performanceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  performanceMessage: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "600",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F59E0B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 1000,
  },
  confettiPiece: {
    position: "absolute",
    borderRadius: 4,
  },
});
