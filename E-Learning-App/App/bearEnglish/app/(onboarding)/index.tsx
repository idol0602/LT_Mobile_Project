import { useEffect } from "react";
import { router } from "expo-router";

export default function OnboardingIndex() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        router.replace("/(onboarding)/welcome");
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return null; 
}
