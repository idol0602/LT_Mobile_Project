import { Stack } from "expo-router";

export default function ListeningLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        // headerStyle: {
        //   backgroundColor: "rgb(38, 39, 48)",
        // },
        // headerTintColor: "#fff",
        // headerTitleStyle: {
        //   fontWeight: "600",
        // },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Listening Lessons",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[lessonId]"
        options={{
          title: "Listening Practice",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
