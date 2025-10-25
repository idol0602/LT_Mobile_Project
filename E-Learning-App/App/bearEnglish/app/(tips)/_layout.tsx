import { Stack } from "expo-router";

export default function TipsLayout() {
  return (
    // Áp dụng headerShown: false cho TẤT CẢ màn hình trong nhóm (tips)
    <Stack
      screenOptions={{
        headerShown: false, // ⭐ ẨN HOÀN TOÀN THANH TIÊU ĐỀ ⭐
      }}
    >
      {/* Bạn vẫn cần định nghĩa các màn hình con để đảm bảo routing hoạt động,
        nhưng bạn không cần đặt tùy chọn header riêng cho chúng nữa.
      */}
      <Stack.Screen name="DailyVocabularyTip" />
      <Stack.Screen name="GrammarRulesTip" />
      <Stack.Screen name="ListenRepeatTip" />
      <Stack.Screen name="ReadStoriesTip" />
      <Stack.Screen name="TipDetailScreen" />
      <Stack.Screen name="index" />
      <Stack.Screen name="modal" />
    </Stack>
  );
}
