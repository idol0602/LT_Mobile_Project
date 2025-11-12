import { Stack } from "expo-router";

export default function VocabulariesLayout() {
  return (
    // Áp dụng headerShown: false cho TẤT CẢ màn hình trong nhóm (vocabularies)
    <Stack
      screenOptions={{
        headerShown: false, // ⭐ ẨN HOÀN TOÀN THANH TIÊU ĐỀ ⭐
        gestureEnabled: true, // Cho phép swipe để quay lại
      }}
    >
      {/* Định nghĩa các màn hình con để đảm bảo routing hoạt động */}
      <Stack.Screen
        name="index"
        options={{
          title: "Vocabulary Lessons",
        }}
      />
      <Stack.Screen
        name="[lessonId]"
        options={{
          title: "Vocabulary Flashcards",
          presentation: "card", // Hiệu ứng chuyển màn hình dạng card
        }}
      />
    </Stack>
  );
}
