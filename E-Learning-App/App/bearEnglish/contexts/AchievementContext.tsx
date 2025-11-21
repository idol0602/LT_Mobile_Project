import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useAchievements, type Achievement } from "../hooks/useAchievements";
import API from "../api";

interface AchievementContextType {
  showAchievementModal: boolean;
  currentAchievement: Achievement | null;
  achievementQueue: Achievement[];
  completeLessonWithAchievementCheck: (
    lessonId: string,
    category: string
  ) => Promise<void>;
  handleCloseAchievementModal: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

export function AchievementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { checkAndUnlock } = useAchievements(user?._id);

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  /**
   * Complete lesson and automatically check for achievements
   */
  const completeLessonWithAchievementCheck = useCallback(
    async (lessonId: string, category: string) => {
      if (!user?._id) {
        console.warn("User not logged in");
        return;
      }

      try {
        console.log(`Completing ${category} lesson:`, lessonId);

        // Complete the lesson
        const response = await API.completeLesson(user._id, lessonId, category);
        console.log("Lesson completed:", response);

        if (response.success) {
          // Check for newly unlocked achievements
          const newAchievements = await checkAndUnlock();

          if (newAchievements && newAchievements.length > 0) {
            console.log(
              "🎉 New achievements unlocked:",
              newAchievements.length
            );

            // Show first achievement immediately
            setCurrentAchievement(newAchievements[0]);
            setShowAchievementModal(true);

            // Queue remaining achievements
            if (newAchievements.length > 1) {
              setAchievementQueue(newAchievements.slice(1));
            }
          }
        }
      } catch (error) {
        console.error("Error completing lesson:", error);
        throw error;
      }
    },
    [user?._id, checkAndUnlock]
  );

  /**
   * Handle closing achievement modal and show next in queue
   */
  const handleCloseAchievementModal = useCallback(() => {
    setShowAchievementModal(false);

    // Show next achievement from queue if available
    if (achievementQueue.length > 0) {
      setTimeout(() => {
        setCurrentAchievement(achievementQueue[0]);
        setAchievementQueue((prev) => prev.slice(1));
        setShowAchievementModal(true);
      }, 500); // Small delay between modals
    } else {
      setCurrentAchievement(null);
    }
  }, [achievementQueue]);

  const value = {
    showAchievementModal,
    currentAchievement,
    achievementQueue,
    completeLessonWithAchievementCheck,
    handleCloseAchievementModal,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievementContext() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error(
      "useAchievementContext must be used within AchievementProvider"
    );
  }
  return context;
}
