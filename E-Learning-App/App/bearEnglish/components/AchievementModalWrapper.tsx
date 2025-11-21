import React from "react";
import { AchievementUnlockModal } from "./AchievementUnlockModal";
import { useAchievementContext } from "../contexts/AchievementContext";

/**
 * Achievement Modal Wrapper
 * Automatically shows achievement unlock modal when achievements are unlocked
 *
 * Usage: Add this component to any screen that completes lessons
 * <AchievementModalWrapper />
 */
export function AchievementModalWrapper() {
  const {
    showAchievementModal,
    currentAchievement,
    handleCloseAchievementModal,
  } = useAchievementContext();

  return (
    <AchievementUnlockModal
      visible={showAchievementModal}
      achievement={currentAchievement}
      onClose={handleCloseAchievementModal}
    />
  );
}
