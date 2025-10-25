import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

// Mẹo 2: Listen & Repeat
export default function ListenRepeatTip() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/learning-tip2.jpg")}
          style={styles.tipImage}
        />
        <Text style={styles.title}>
          Luyện Nghe và Phát Âm: Kỹ Thuật 'Shadowing' Đỉnh Cao
        </Text>
        {/* ... (Nội dung còn lại) ... */}
        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            🎧 Phương pháp Shadowing (Nói Đuổi)
          </Text>
          <Text style={styles.paragraph}>
            Shadowing là kỹ thuật bắt chước người bản xứ nói ngay lập tức, giống
            như một cái "bóng" (shadow). Kỹ thuật này giúp bạn bắt chước **ngữ
            điệu**, **nhấn nhá**, **nối âm** và **cách phát âm** một cách tự
            nhiên nhất.
          </Text>
          <Text style={styles.bullet}>
            • **Bước 1:** Chọn nguồn nghe phù hợp (podcast, TED Talks, phim ảnh)
            có kèm phụ đề/transcript.
          </Text>
          <Text style={styles.bullet}>
            • **Bước 2:** Nghe và hiểu nội dung tổng quát trước.
          </Text>
          <Text style={styles.bullet}>
            • **Bước 3:** Bật file nghe và lặp lại *cùng lúc* với người nói, cố
            gắng bắt chước ngữ điệu, tốc độ, và cách phát âm của họ.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>🎧 Tập trung vào Âm Vị và Ngữ Điệu</Text>
          <Text style={styles.paragraph}>
            Nắm vững **Bảng Phiên Âm Quốc Tế (IPA)** là nền tảng. Khi học một từ
            mới, hãy tra phiên âm của nó. Ngoài ra, hãy chú ý đến ngữ điệu lên
            xuống trong câu, đặc biệt là các câu hỏi và câu cảm thán, để nghe tự
            nhiên hơn.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>🎧 Ghi Âm và So Sánh</Text>
          <Text style={styles.paragraph}>
            Sau khi luyện tập, hãy tự ghi âm giọng nói của mình và so sánh với
            giọng của người bản xứ. Điều này giúp bạn tự nhận ra và sửa chữa
            những lỗi sai về âm, trọng âm hay ngữ điệu mà bạn khó nhận ra khi
            chỉ nghe.
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
  tipImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D8BFD8",
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
    color: "#ADD8E6",
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
