/**
 * Example: How to integrate achievements into lesson completion
 *
 * This file demonstrates how to use the useAchievements hook
 * and AchievementUnlockModal component in your lesson pages.
 */

import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useAchievements } from "../hooks/useAchievements";
import { AchievementUnlockModal } from "../components/AchievementUnlockModal";
import API from "../api";

export function ExampleLessonPage() {
  const { user } = useAuth();

  // Initialize achievement hook
  const { checkAndUnlock, newlyUnlocked, clearNewlyUnlocked } = useAchievements(
    user?._id
  );

  // Track which achievement to show in modal
  const [currentUnlockedAchievement, setCurrentUnlockedAchievement] =
    useState<any>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  /**
   * Call this function after completing a lesson
   */
  const handleLessonComplete = async (lessonId: string, category: string) => {
    try {
      // 1. Complete the lesson in backend
      const response = await API.completeLesson(
        user!._id as string,
        lessonId,
        category
      );

      console.log("Lesson completed:", response);

      // 2. Check for newly unlocked achievements
      const unlockedAchievements = await checkAndUnlock();

      // 3. Show achievement unlock modals one by one
      if (unlockedAchievements.length > 0) {
        showAchievementUnlockSequence(unlockedAchievements);
      }

      // 4. Navigate or show success message
      // router.back();
    } catch (error) {
      console.error("Error completing lesson:", error);
      Alert.alert("Error", "Failed to complete lesson");
    }
  };

  /**
   * Show achievement unlock modals in sequence
   */
  const showAchievementUnlockSequence = (achievements: any[]) => {
    if (achievements.length === 0) return;

    // Show first achievement
    setCurrentUnlockedAchievement(achievements[0]);
    setShowAchievementModal(true);

    // Queue remaining achievements
    const remainingAchievements = achievements.slice(1);
    if (remainingAchievements.length > 0) {
      // Store in state or queue for later
      console.log("More achievements to show:", remainingAchievements.length);
    }
  };

  /**
   * Handle closing achievement modal
   */
  const handleCloseAchievementModal = () => {
    setShowAchievementModal(false);
    setCurrentUnlockedAchievement(null);

    // Clear the newly unlocked list
    clearNewlyUnlocked();
  };

  /**
   * Alternative: Show all achievements in a summary
   */
  const showAchievementSummary = (achievements: any[]) => {
    const names = achievements.map((a) => `• ${a.name}`).join("\n");
    Alert.alert(
      "🎉 Achievements Unlocked!",
      `Congratulations! You've unlocked:\n\n${names}`,
      [{ text: "Awesome!", style: "default" }]
    );
  };

  return (
    <View>
      {/* Your lesson content here */}

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        visible={showAchievementModal}
        achievement={currentUnlockedAchievement}
        onClose={handleCloseAchievementModal}
      />
    </View>
  );
}

/**
 * Example: Using achievements in the home screen
 */
export function ExampleHomeScreen() {
  const { user } = useAuth();

  const {
    achievements,
    stats,
    loading,
    getUnlockedAchievements,
    getLockedAchievements,
  } = useAchievements(user?._id);

  if (loading) {
    return <View>{/* Loading spinner */}</View>;
  }

  return (
    <View>
      {/* Display achievement stats */}
      {stats && (
        <View>
          {/* Total unlocked: {stats.unlockedAchievements} / {stats.totalAchievements} */}
          {/* Progress: {stats.percentageUnlocked}% */}
        </View>
      )}

      {/* Display unlocked achievements */}
      {getUnlockedAchievements().map((userAchievement) => (
        <View key={userAchievement.achievement._id}>
          {/* Achievement card: {userAchievement.achievement.name} */}
        </View>
      ))}

      {/* Display locked achievements */}
      {getLockedAchievements().map((userAchievement) => (
        <View key={userAchievement.achievement._id}>
          {/* Locked achievement: {userAchievement.achievement.name} */}
        </View>
      ))}
    </View>
  );
}
