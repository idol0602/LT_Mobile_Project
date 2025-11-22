import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import API from '../api';

/**
 * Hook để tự động tracking app session time
 * Sử dụng AppState để detect khi app vào background/foreground
 */
export const useAppSession = (userId: string | undefined) => {
  const sessionStartTime = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!userId) return;

    // Start app session khi vào app
    const startSession = async () => {
      try {
        sessionStartTime.current = Date.now();
        await API.startAppSession(userId);
        console.log('✅ App session started');
      } catch (error) {
        console.error('❌ Failed to start app session:', error);
      }
    };

    startSession();

    // Listen to app state changes
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log(`📱 App state changed: ${appState.current} → ${nextAppState}`);

      // App đi vào background (inactive hoặc background)
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        if (sessionStartTime.current) {
          const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
          console.log(`⏸️ App going to background, saving session: ${duration}s`);
          
          try {
            await API.endAppSession(userId, duration);
            console.log(`✅ Session saved: ${duration}s`);
            sessionStartTime.current = null;
          } catch (error) {
            console.error('❌ Failed to save session:', error);
          }
        }
      }

      // App quay lại foreground (active)
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('▶️ App returning to foreground, starting new session');
        try {
          sessionStartTime.current = Date.now();
          await API.startAppSession(userId);
          console.log('✅ New session started');
        } catch (error) {
          console.error('❌ Failed to start new session:', error);
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup when component unmounts
    return () => {
      subscription.remove();
      
      // Lưu session cuối cùng (nếu có)
      if (sessionStartTime.current) {
        const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
        console.log(`🔚 Component unmounting, saving final session: ${duration}s`);
        
        // Gọi API sync (best effort)
        API.endAppSession(userId, duration).catch((error) => {
          console.error('❌ Failed to save final session:', error);
        });
      }
    };
  }, [userId]);
};
