import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Achievement } from "../hooks/useAchievements";

interface AchievementUnlockModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementUnlockModal({
  visible,
  achievement,
  onClose,
}: AchievementUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!achievement) return null;

  const getDifficultyColor = (): [string, string] => {
    switch (achievement.difficulty) {
      case "easy":
        return ["#4CAF50", "#81C784"];
      case "normal":
        return ["#FF9800", "#FFB74D"];
      case "hard":
        return ["#F44336", "#E57373"];
      default:
        return ["#00D4FF", "#00FFAA"];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient
            colors={getDifficultyColor()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Confetti Effect */}
            <Text style={styles.confetti}>🎉</Text>

            {/* Achievement Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{achievement.icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Achievement Unlocked!</Text>

            {/* Achievement Name */}
            <Text style={styles.name}>{achievement.name}</Text>

            {/* Description */}
            <Text style={styles.description}>{achievement.description}</Text>

            {/* Difficulty Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {achievement.difficulty.toUpperCase()}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confetti: {
    fontSize: 40,
    position: "absolute",
    top: 20,
    right: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
