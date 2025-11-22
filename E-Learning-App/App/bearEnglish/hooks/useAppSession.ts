import { useEffect, useRef } from 'react';
import API from '../api';

/**
 * Hook để tự động tracking app session time
 * Tự động start khi component mount và end khi unmount
 */
export const useAppSession = (userId: string | undefined) => {
  const sessionStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Start app session khi vào app
    const startSession = async () => {
      try {
        sessionStartTime.current = Date.now();
        await API.startAppSession(userId);
        console.log('App session started');
      } catch (error) {
        console.error('Failed to start app session:', error);
      }
    };

    startSession();

    // End app session khi thoát app
    return () => {
      if (sessionStartTime.current) {
        const endSession = async () => {
          try {
            const duration = Math.floor((Date.now() - sessionStartTime.current!) / 1000); // seconds
            await API.endAppSession(userId, duration);
            console.log(`App session ended. Duration: ${duration}s`);
          } catch (error) {
            console.error('Failed to end app session:', error);
          }
        };

        endSession();
      }
    };
  }, [userId]);
};
