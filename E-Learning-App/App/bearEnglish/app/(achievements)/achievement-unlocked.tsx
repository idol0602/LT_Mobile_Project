import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAchievementContext } from "../../contexts/AchievementContext";

const { width, height } = Dimensions.get("window");

const getDifficultyColor = (difficulty: string): [string, string] => {
  switch (difficulty?.toLowerCase()) {
    case "bronze":
      return ["#CD7F32", "#8B4513"];
    case "silver":
      return ["#C0C0C0", "#808080"];
    case "gold":
      return ["#FFD700", "#FFA500"];
    case "platinum":
      return ["#E5E4E2", "#A8A8A8"];
    case "diamond":
      return ["#B9F2FF", "#00CED1"];
    default:
      return ["#8B5CF6", "#6D28D9"];
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "bronze":
      return "medal-outline";
    case "silver":
      return "medal-outline";
    case "gold":
      return "trophy-outline";
    case "platinum":
      return "trophy";
    case "diamond":
      return "diamond-outline";
    default:
      return "star-outline";
  }
};

export default function AchievementUnlockedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { achievementQueue, setAchievementQueue } = useAchievementContext();

  // Parse achievement data from params
  const achievement = params.achievement
    ? JSON.parse(params.achievement as string)
    : null;

  // Animations
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const rotateAnim = new Animated.Value(0);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Trophy scales in with rotation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Content fades in and slides up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    // Check if there are more achievements in queue
    if (achievementQueue.length > 0) {
      const nextAchievement = achievementQueue[0];
      setAchievementQueue((prev) => prev.slice(1));

      router.push({
        pathname: "/(achievements)/achievement-unlocked",
        params: {
          achievement: JSON.stringify(nextAchievement),
        },
      });
    } else {
      router.back();
    }
  };

  if (!achievement) {
    return null;
  }

  const colors = getDifficultyColor(achievement.difficulty);
  const iconName = getDifficultyIcon(achievement.difficulty);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "0deg"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Background Circles */}
      <View style={styles.backgroundCircles}>
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            {
              opacity: glowOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[`${colors[0]}40`, `${colors[1]}20`]}
            style={styles.circleGradient}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            {
              opacity: glowOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[`${colors[1]}40`, `${colors[0]}20`]}
            style={styles.circleGradient}
          />
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Trophy Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }, { rotate: rotation }],
            },
          ]}
        >
          <LinearGradient colors={colors} style={styles.iconGradient}>
            <Ionicons name={iconName as any} size={120} color="#fff" />
          </LinearGradient>
          <Animated.View
            style={[
              styles.iconGlow,
              {
                opacity: glowOpacity,
              },
            ]}
          >
            <LinearGradient
              colors={[`${colors[0]}80`, "transparent"]}
              style={styles.glowGradient}
            />
          </Animated.View>
        </Animated.View>

        {/* Title and Description */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Achievement Unlocked!</Text>
          <Text style={styles.achievementName}>{achievement.name}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          {/* Difficulty Badge */}
          <View style={styles.badgeContainer}>
            <LinearGradient colors={colors} style={styles.badge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.badgeText}>
                {achievement.difficulty?.toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          {/* Rewards */}
          {achievement.rewards && achievement.rewards > 0 && (
            <View style={styles.rewardsContainer}>
              <Ionicons name="gift" size={24} color="#FFD700" />
              <Text style={styles.rewardsText}>
                +{achievement.rewards} Points
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Queue indicator */}
          {achievementQueue.length > 0 && (
            <View style={styles.queueIndicator}>
              <Ionicons name="trophy" size={16} color="#FFD700" />
              <Text style={styles.queueText}>
                +{achievementQueue.length} more achievement
                {achievementQueue.length > 1 ? "s" : ""} unlocked!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>
                {achievementQueue.length > 0 ? "Next Achievement" : "Continue"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Floating Particles */}
      <View style={styles.particles}>
        {[...Array(20)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: glowOpacity,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.3,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  circleGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 40,
    position: "relative",
  },
  iconGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -20,
    left: -20,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 120,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  achievementName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: "#d0d0d0",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  badgeContainer: {
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  rewardsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  rewardsText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  queueIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  queueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
  continueButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  continueText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFD700",
  },
});
