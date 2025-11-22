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
  conditions: Array<{
    key: string;
    operator: string;
    value: any;
  }>;
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
      
      console.log('Achievement API response:', response);
      
      if (response.success) {
        // Validate and filter out invalid data
        const validAchievements = (response.data || []).filter((item: any) => {
          if (!item || typeof item !== 'object') {
            console.warn('Invalid achievement item:', item);
            return false;
          }
          if (!item.achievement || typeof item.achievement !== 'object') {
            console.warn('Achievement missing "achievement" field:', item);
            return false;
          }
          return true;
        });
        
        console.log('Valid achievements:', validAchievements.length);
        setAchievements(validAchievements);
      } else {
        throw new Error(response.message || 'Failed to fetch achievements');
      }
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Failed to load achievements');
      setAchievements([]); // Reset to empty array on error
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
    if (!userId) {
      console.log('❌ checkAndUnlock: No userId');
      return [];
    }

    try {
      console.log('🔍 Calling API.checkAndUnlockAchievements for user:', userId);
      const response = await API.checkAndUnlockAchievements(userId);
      console.log('📦 checkAndUnlockAchievements response:', response);
      
      if (response.success && response.data.newlyUnlocked?.length > 0) {
        console.log('✅ Found newly unlocked achievements:', response.data.newlyUnlocked);
        setNewlyUnlocked(response.data.newlyUnlocked);
        
        // Refresh achievements list
        await fetchAchievements();
        await fetchStats();
        
        return response.data.newlyUnlocked;
      } else {
        console.log('ℹ️ No newly unlocked achievements. Response:', {
          success: response.success,
          hasData: !!response.data,
          newlyUnlockedLength: response.data?.newlyUnlocked?.length
        });
      }
      
      return [];
    } catch (err: any) {
      console.error('❌ Error checking achievements:', err);
      return [];
    }
  }, [userId, fetchAchievements, fetchStats]);

  /**
   * Get unlocked achievements only
   */
  const getUnlockedAchievements = useCallback((): UserAchievement[] => {
    return achievements.filter(a => a && a.achievement && a.unlocked);
  }, [achievements]);

  /**
   * Get locked achievements only (excluding hidden ones)
   */
  const getLockedAchievements = useCallback((): UserAchievement[] => {
    return achievements.filter(a => a && a.achievement && !a.unlocked && !a.achievement.hidden);
  }, [achievements]);

  /**
   * Get achievements by difficulty
   */
  const getAchievementsByDifficulty = useCallback((difficulty: 'easy' | 'normal' | 'hard'): UserAchievement[] => {
    return achievements.filter(a => a && a.achievement && a.achievement.difficulty === difficulty);
  }, [achievements]);

  /**
   * Get achievements by type
   */
  const getAchievementsByType = useCallback((type: Achievement['type']): UserAchievement[] => {
    return achievements.filter(a => a && a.achievement && a.achievement.type === type);
  }, [achievements]);

  /**
   * Calculate progress for a specific achievement
   */
  const calculateProgress = useCallback((achievement: Achievement, userProgress: any): number => {
    if (!userProgress || !achievement.conditions || achievement.conditions.length === 0) return 0;

    const progressValues: number[] = [];

    // Evaluate each condition
    for (const condition of achievement.conditions) {
      const { key, operator, value } = condition;
      let currentValue: any;
      let targetValue: any = value;

      // Get current value based on key
      switch (key) {
        case 'totalLessons':
          currentValue = userProgress.totalCompleted || 0;
          break;
        case 'wordsLearned':
          currentValue = userProgress.wordsLearned || 0;
          break;
        case 'streak':
          currentValue = userProgress.streak || 0;
          break;
        case 'lessonScore':
          currentValue = userProgress.lastLessonScore || 0;
          break;
        case 'category':
          // For category, we check if it matches
          currentValue = userProgress.lastCategory || '';
          break;
        case 'lessonsInOneDay':
          currentValue = userProgress.lessonsToday || 0;
          break;
        case 'completionTime':
          currentValue = userProgress.lastCompletionTime || 0;
          break;
        case 'achievementsCount':
          currentValue = userProgress.achievementsUnlocked || 0;
          break;
        default:
          currentValue = 0;
      }

      // Calculate progress based on operator (only for numeric comparisons)
      if (operator === '>=' || operator === '<=' || operator === '>' || operator === '<') {
        if (typeof currentValue === 'number' && typeof targetValue === 'number') {
          const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
          progressValues.push(Math.min(percentage, 100));
        }
      } else if (operator === '=') {
        // For exact match, either 0% or 100%
        progressValues.push(currentValue === targetValue ? 100 : 0);
      }
      // For 'in' and 'contains' operators, we don't calculate progress (0 or 100)
    }

    // Return average progress across all conditions
    if (progressValues.length === 0) return 0;
    const avgProgress = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
    return Math.min(avgProgress, 100);
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
