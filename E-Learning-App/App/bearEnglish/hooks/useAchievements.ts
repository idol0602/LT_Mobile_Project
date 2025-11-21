import { useState, useEffect, useCallback } from 'react';
import API from '../api';

export interface Achievement {
  _id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  type: 'first' | 'progress' | 'vocab' | 'streak' | 'global';
  difficulty: 'easy' | 'normal' | 'hard';
  condition: {
    minLessonsCompleted?: number;
    minWordsLearned?: number;
    minStreak?: number;
    category?: string;
  };
  hidden: boolean;
}

export interface UserAchievement {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  lockedAchievements: number;
  percentageUnlocked: number;
  byDifficulty: {
    easy: { total: number; unlocked: number };
    normal: { total: number; unlocked: number };
    hard: { total: number; unlocked: number };
  };
  byType: {
    first: { total: number; unlocked: number };
    progress: { total: number; unlocked: number };
    vocab: { total: number; unlocked: number };
    streak: { total: number; unlocked: number };
    global: { total: number; unlocked: number };
  };
}

/**
 * Custom hook for managing user achievements
 * @param userId - The ID of the current user
 */
export function useAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  /**
   * Fetch all achievements for the user
   */
  const fetchAchievements = useCallback(async () => {
    if (!userId) {
      setAchievements([]);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await API.getUserAchievements(userId);
      
      if (response.success) {
        setAchievements(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch achievements');
      }
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch achievement statistics
   */
  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats(null);
      return;
    }

    try {
      const response = await API.getUserAchievementStats(userId);
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching achievement stats:', err);
    }
  }, [userId]);

  /**
   * Check and unlock achievements based on current progress
   * Returns newly unlocked achievements
   */
  const checkAndUnlock = useCallback(async (): Promise<Achievement[]> => {
    if (!userId) return [];

    try {
      const response = await API.checkAndUnlockAchievements(userId);
      
      if (response.success && response.data.newlyUnlocked?.length > 0) {
        setNewlyUnlocked(response.data.newlyUnlocked);
        
        // Refresh achievements list
        await fetchAchievements();
        await fetchStats();
        
        return response.data.newlyUnlocked;
      }
      
      return [];
    } catch (err: any) {
      console.error('Error checking achievements:', err);
      return [];
    }
  }, [userId, fetchAchievements, fetchStats]);

  /**
   * Get unlocked achievements only
   */
  const getUnlockedAchievements = useCallback((): UserAchievement[] => {
    return achievements.filter(a => a.unlocked);
  }, [achievements]);

  /**
   * Get locked achievements only (excluding hidden ones)
   */
  const getLockedAchievements = useCallback((): UserAchievement[] => {
    return achievements.filter(a => !a.unlocked && !a.achievement.hidden);
  }, [achievements]);

  /**
   * Get achievements by difficulty
   */
  const getAchievementsByDifficulty = useCallback((difficulty: 'easy' | 'normal' | 'hard'): UserAchievement[] => {
    return achievements.filter(a => a.achievement.difficulty === difficulty);
  }, [achievements]);

  /**
   * Get achievements by type
   */
  const getAchievementsByType = useCallback((type: Achievement['type']): UserAchievement[] => {
    return achievements.filter(a => a.achievement.type === type);
  }, [achievements]);

  /**
   * Calculate progress for a specific achievement
   */
  const calculateProgress = useCallback((achievement: Achievement, userProgress: any): number => {
    if (!userProgress) return 0;

    const condition = achievement.condition;
    let progress = 0;

    // Check lessons completed
    if (condition.minLessonsCompleted) {
      const completed = condition.category 
        ? userProgress[condition.category]?.completed || 0
        : userProgress.totalCompleted || 0;
      
      progress = Math.max(progress, (completed / condition.minLessonsCompleted) * 100);
    }

    // Check words learned
    if (condition.minWordsLearned) {
      const learned = userProgress.wordsLearned || 0;
      progress = Math.max(progress, (learned / condition.minWordsLearned) * 100);
    }

    // Check streak
    if (condition.minStreak) {
      const streak = userProgress.streak || 0;
      progress = Math.max(progress, (streak / condition.minStreak) * 100);
    }

    return Math.min(progress, 100);
  }, []);

  /**
   * Clear newly unlocked achievements (after showing notification)
   */
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  // Fetch achievements on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchAchievements();
      fetchStats();
    }
  }, [userId, fetchAchievements, fetchStats]);

  return {
    // Data
    achievements,
    stats,
    newlyUnlocked,
    
    // Loading states
    loading,
    error,
    
    // Actions
    refresh: fetchAchievements,
    checkAndUnlock,
    clearNewlyUnlocked,
    
    // Helpers
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByDifficulty,
    getAchievementsByType,
    calculateProgress,
  };
}
