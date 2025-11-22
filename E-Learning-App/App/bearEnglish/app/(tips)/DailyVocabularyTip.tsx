import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Clock, Target, Lightbulb } from "lucide-react-native";

// Mẹo 1: Daily Vocabulary
export default function DailyVocabularyTip() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <LinearGradient colors={["#4CAF50", "#66BB6A"]} style={styles.heroCard}>
          <BookOpen size={40} color="#ffffff" />
          <Text style={styles.heroTitle}>Học 5 Từ Mới Mỗi Ngày</Text>
          <Text style={styles.heroSubtitle}>
            Bí quyết tăng tốc vốn từ hiệu quả
          </Text>
        </LinearGradient>

        <LinearGradient colors={["#2196F3", "#42A5F5"]} style={styles.tipCard}>
          <View style={styles.cardHeader}>
            <Clock size={24} color="#ffffff" />
            <Text style={styles.cardTitle}>
              Spaced Repetition - Lặp lại ngắt quãng
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            Phương pháp khoa học giúp ghi nhớ lâu dài. Ôn tập đúng thời điểm:
          </Text>
          <View style={styles.stepsList}>
            <Text style={styles.step}>✓ Học 5 từ mới buổi sáng</Text>
            <Text style={styles.step}>✓ Ôn lại sau 1 giờ</Text>
            <Text style={styles.step}>✓ Ôn lại trước khi ngủ</Text>
            <Text style={styles.step}>✓ Ôn lại sau 1, 3, 7 ngày</Text>
          </View>
        </LinearGradient>

        <LinearGradient colors={["#FF9800", "#FFA726"]} style={styles.tipCard}>
          <View style={styles.cardHeader}>
            <Target size={24} color="#ffffff" />
            <Text style={styles.cardTitle}>Học theo cụm từ và ngữ cảnh</Text>
          </View>
          <Text style={styles.cardDescription}>
            Đừng học từ đơn lẻ! Hãy học theo collocations và ngữ cảnh cụ thể.
          </Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              Ví dụ: "take a walk", "walk briskly" thay vì chỉ "walk"
            </Text>
          </View>
        </LinearGradient>

        <LinearGradient colors={["#9C27B0", "#BA68C8"]} style={styles.tipCard}>
          <View style={styles.cardHeader}>
            <Lightbulb size={24} color="#ffffff" />
            <Text style={styles.cardTitle}>Mnemonics và hình ảnh</Text>
          </View>
          <Text style={styles.cardDescription}>
            Sử dụng hình ảnh, câu chuyện hoặc liên kết để ghi nhớ dễ dàng hơn.
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Tạo flashcard có hình ảnh</Text>
            <Text style={styles.tipItem}>• Kết hợp âm thanh và thị giác</Text>
            <Text style={styles.tipItem}>• Tạo câu chuyện thú vị</Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#1a1a2e",
  },
  container: {
    padding: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontStyle: "italic",
  },
  tipCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginLeft: 12,
    flex: 1,
  },
  cardDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    marginBottom: 16,
  },
  stepsList: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
  },
  step: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 8,
    fontWeight: "500",
  },
  exampleBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  exampleText: {
    fontSize: 14,
    color: "#ffffff",
    fontStyle: "italic",
    textAlign: "center",
  },
  tipsList: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 6,
    lineHeight: 20,
  },
});
