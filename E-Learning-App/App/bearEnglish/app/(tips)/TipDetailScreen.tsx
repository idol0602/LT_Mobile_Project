import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// Import các components mẹo học chi tiết
import DailyVocabularyTip from "./DailyVocabularyTip";
import ListenRepeatTip from "./ListenRepeatTip";
import ReadStoriesTip from "./ReadStoriesTip";
import GrammarRulesTip from "./GrammarRulesTip";

// Định nghĩa cấu trúc Tip
interface Tip {
  id: number;
  title: string;
  description: string;
}

// Giả định dữ liệu tips
const TIPS: Tip[] = [
  {
    id: 1,
    title: "Daily Vocabulary",
    description: "Learn 5 new words every day",
  },
  {
    id: 2,
    title: "Listen & Repeat",
    description: "Practice pronunciation with native speakers",
  },
  {
    id: 3,
    title: "Read Stories",
    description: "Improve reading comprehension",
  },
  {
    id: 4,
    title: "Grammar Rules",
    description: "Master English grammar basics",
  },
];

export default function TipDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Ép kiểu id từ string (params luôn là string) sang number
  const tipId = Number(params.id);

  // Tìm tip tương ứng
  const tip = TIPS.find((t) => t.id === tipId);

  // Hàm quyết định component nào sẽ được render
  const renderTipComponent = () => {
    // ... (logic switch case)
    switch (tipId) {
      case 1:
        return <DailyVocabularyTip />;
      case 2:
        return <ListenRepeatTip />;
      case 3:
        return <ReadStoriesTip />;
      case 4:
        return <GrammarRulesTip />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không tìm thấy mẹo học này! 😕</Text>
          </View>
        );
    }
  };

  if (!tip) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.title}>Lỗi!</Text>
        <Text style={styles.errorText}>
          ID mẹo không hợp lệ. Vui lòng kiểm tra lại đường dẫn.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Giữ lại nút Back thủ công */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{"< Trở về"}</Text>
      </TouchableOpacity>

      <Text style={styles.mainTitle}>{tip.title}</Text>

      {renderTipComponent()}
    </View>
  );
}

// ⭐ LƯU Ý QUAN TRỌNG: Bạn KHÔNG CẦN đoạn TipDetailScreen.options = {...}
// nữa vì đã cấu hình trong _layout.tsx.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
    paddingTop: 30, // Vẫn cần điều chỉnh padding vì header đã bị ẩn
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF6347",
    textAlign: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#ADD8E6",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#D8BFD8",
    fontSize: 18,
    textAlign: "center",
  },
});
