import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

// Mẹo 1: Daily Vocabulary
export default function DailyVocabularyTip() {
  return (
    // ⭐ Đặt showsVerticalScrollIndicator={false} để ẩn thanh cuộn ⭐
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* ⭐ THÊM HÌNH ẢNH MINH HỌA ⭐ */}
        <Image
          source={require("../../assets/images/learning-tip.jpg")}
          style={styles.tipImage}
        />

        <Text style={styles.title}>
          Học 5 Từ Mới Mỗi Ngày: Bí Quyết Tăng Tốc Vốn Từ
        </Text>
        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            ⭐ Nguyên tắc Spaced Repetition (Lặp Lại Ngắt Quãng)
          </Text>
          <Text style={styles.paragraph}>
            Đây là phương pháp khoa học giúp bạn ghi nhớ lâu dài. Thay vì nhồi
            nhét, bạn hãy ôn tập từ vựng đúng thời điểm:
          </Text>
          <Text style={styles.bullet}>• Học 5 từ mới vào Buổi sáng.</Text>
          <Text style={styles.bullet}>• Ôn lại sau 1 giờ.</Text>
          <Text style={styles.bullet}>• Ôn lại trước khi ngủ.</Text>
          <Text style={styles.bullet}>
            • Ôn lại vào ngày hôm sau, 3 ngày sau, và 7 ngày sau.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            ⭐ Học Theo Cụm Từ, Ngữ Cảnh và Chủ Đề
          </Text>
          <Text style={styles.paragraph}>
            Đừng học từ đơn lẻ! Hãy học các từ đi kèm với nhau (collocations)
            hoặc trong một câu, một đoạn văn cụ thể. Ví dụ, thay vì chỉ học
            "walk", hãy học "take a walk" (đi dạo), "walk briskly" (đi nhanh).
            Việc này giúp bạn hiểu cách sử dụng từ đúng và tự nhiên hơn. Ưu tiên
            các từ vựng theo chủ đề bạn yêu thích hoặc cần dùng trong công
            việc/học tập.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            ⭐ Sử dụng Phương pháp Mnemonics và Hình Ảnh
          </Text>
          <Text style={styles.paragraph}>
            Sử dụng hình ảnh, câu chuyện hài hước hoặc từ viết tắt để kết nối từ
            mới với những thứ quen thuộc, dễ nhớ. Bạn cũng nên tạo flashcard
            hoặc sử dụng các ứng dụng học từ vựng có tích hợp hình ảnh và âm
            thanh để kích thích cả thị giác và thính giác.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  container: {
    padding: 20,
  },
  // ⭐ STYLE CHO HÌNH ẢNH ⭐
  tipImage: {
    width: "100%",
    height: 200, // Chiều cao cố định cho ảnh
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover", // Đảm bảo ảnh cover hết không gian
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D8BFD8", // Màu tím nhạt cho tiêu đề
    marginBottom: 20,
    textAlign: "center",
  },
  contentSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ADD8E6", // Màu xanh nhạt cho tiêu đề phụ
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: "#E0E0E0",
    lineHeight: 24,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#E0E0E0",
    marginLeft: 10,
    lineHeight: 24,
  },
});
