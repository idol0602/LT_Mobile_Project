import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api';

interface StudyTimeData {
  totalStudyTime: number;
  studyTimeToday: number;
  studyTimeByCategory: {
    reading: number;
    vocab: number;
    listening: number;
    grammar: number;
  };
}

interface UseStudyTimeReturn {
  studyTime: StudyTimeData | null;
  loading: boolean;
  error: string | null;
  sessionActive: boolean;
  sessionDuration: number;
  startSession: (category: string) => Promise<void>;
  endSession: () => Promise<void>;
  refreshStudyTime: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

/**
 * Custom hook for tracking and managing study time
 * @param userId - The ID of the current user
 * @param autoTrack - Automatically track time when component mounts (default: false)
 */
export function useStudyTime(userId: string | undefined, autoTrack: boolean = false): UseStudyTimeReturn {
  const [studyTime, setStudyTime] = useState<StudyTimeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const sessionStartTime = useRef<number | null>(null);
  const currentCategory = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetch study time statistics from API
   */
  const refreshStudyTime = useCallback(async () => {
    if (!userId) {
      setStudyTime(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await API.getStudyTime(userId);
      
      if (response.success) {
        setStudyTime(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch study time');
      }
    } catch (err: any) {
      console.error('Error fetching study time:', err);
      setError(err.message || 'Failed to load study time');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Start a study session
   */
  const startSession = useCallback(async (category: string) => {
    if (!userId || sessionActive) return;

    try {
      await API.startStudySession(userId, category);
      
      sessionStartTime.current = Date.now();
      currentCategory.current = category;
      setSessionActive(true);
      setSessionDuration(0);

      // Start interval to update duration every second
      intervalRef.current = setInterval(() => {
        if (sessionStartTime.current) {
          const elapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
          setSessionDuration(elapsed);
        }
      }, 1000);

      console.log(`📚 Study session started for ${category}`);
    } catch (err: any) {
      console.error('Error starting study session:', err);
    }
  }, [userId, sessionActive]);

  /**
   * End the current study session
   */
  const endSession = useCallback(async () => {
    if (!userId || !sessionActive || !sessionStartTime.current || !currentCategory.current) {
      return;
    }

    try {
      const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      await API.endStudySession(userId, currentCategory.current, duration);
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      sessionStartTime.current = null;
      currentCategory.current = null;
      setSessionActive(false);
      setSessionDuration(0);

      // Refresh study time stats
      await refreshStudyTime();

      console.log(`✅ Study session ended. Duration: ${duration}s`);
    } catch (err: any) {
      console.error('Error ending study session:', err);
    }
  }, [userId, sessionActive, refreshStudyTime]);

  /**
   * Format seconds to human-readable time
   * @param seconds - Number of seconds
   * @returns Formatted string (e.g., "2h 30m" or "45m" or "30s")
   */
  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    return `${minutes}m`;
  }, []);

  // Fetch study time on mount
  useEffect(() => {
    if (userId) {
      refreshStudyTime();
    }
  }, [userId, refreshStudyTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    studyTime,
    loading,
    error,
    sessionActive,
    sessionDuration,
    startSession,
    endSession,
    refreshStudyTime,
    formatTime,
  };
}
