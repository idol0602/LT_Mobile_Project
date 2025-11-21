import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useAchievements, type Achievement } from "../hooks/useAchievements";
import API from "../api";

interface AchievementContextType {
  achievementQueue: Achievement[];
  completeLessonWithAchievementCheck: (
    lessonId: string,
    category: string
  ) => Promise<Achievement[]>; // Return achievements instead of void
  setAchievementQueue: React.Dispatch<React.SetStateAction<Achievement[]>>;
  clearQueue: () => void;
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
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  /**
   * Complete lesson and automatically check for achievements
   * Returns array of newly unlocked achievements
   */
  const completeLessonWithAchievementCheck = useCallback(
    async (lessonId: string, category: string): Promise<Achievement[]> => {
      if (!user?._id) {
        console.warn("User not logged in");
        return [];
      }

      try {
        console.log(`Completing ${category} lesson:`, lessonId);

        // Complete the lesson
        const response = await API.completeLesson(user._id, lessonId, category);
        console.log("Lesson completed:", response);

        if (response.success) {
          // Check for newly unlocked achievements
          console.log("🔍 Checking for achievements...");
          const newAchievements = await checkAndUnlock();
          console.log("🎯 checkAndUnlock returned:", newAchievements);

          if (newAchievements && newAchievements.length > 0) {
            console.log(
              "🎉 New achievements unlocked:",
              newAchievements.length,
              newAchievements
            );

            // Queue remaining achievements (all except first)
            if (newAchievements.length > 1) {
              setAchievementQueue(newAchievements.slice(1));
            }

            return newAchievements;
          } else {
            console.log("❌ No new achievements unlocked");
          }
        } else {
          console.log("❌ Lesson completion failed:", response);
        }

        return [];
      } catch (error) {
        console.error("Error completing lesson:", error);
        throw error;
      }
    },
    [user?._id, checkAndUnlock]
  );

  /**
   * Clear achievement queue
   */
  const clearQueue = useCallback(() => {
    setAchievementQueue([]);
  }, []);

  const value = {
    achievementQueue,
    completeLessonWithAchievementCheck,
    setAchievementQueue,
    clearQueue,
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
