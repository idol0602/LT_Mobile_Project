import { Stack } from "expo-router";

export default function AchievementsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        presentation: "modal",
      }}
    >
      <Stack.Screen name="achievement-unlocked" />
    </Stack>
  );
}
