import { Stack } from "expo-router";

export default function GrammarLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Grammar Lessons",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: "Grammar Practice",
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          headerShown: false,
          title: "Results",
        }}
      />
    </Stack>
  );
}
