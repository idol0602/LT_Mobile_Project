import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";

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
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.mainTitle}>{tip.title}</Text>
        <Text style={styles.subtitle}>{tip.description}</Text>
      </LinearGradient>

      <View style={styles.contentContainer}>{renderTipComponent()}</View>
    </View>
  );
}

// ⭐ LƯU Ý QUAN TRỌNG: Bạn KHÔNG CẦN đoạn TipDetailScreen.options = {...}
// nữa vì đã cấu hình trong _layout.tsx.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontStyle: "italic",
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});
