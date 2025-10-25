import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

// Mẹo 3: Read Stories
export default function ReadStoriesTip() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/learning-tip3.jpg")}
          style={styles.tipImage}
        />
        <Text style={styles.title}>
          Đọc Truyện Tiếng Anh: Cải Thiện Đọc Hiểu và Thư Giãn
        </Text>
        {/* ... (Nội dung còn lại) ... */}
        <View style={styles.contentSection}>
          <Text style={styles.heading}>📚 Lựa chọn Tài liệu Phù Hợp</Text>
          <Text style={styles.paragraph}>
            Bắt đầu với truyện tranh, truyện ngắn song ngữ hoặc sách đã đọc bằng
            tiếng Việt để bạn đã nắm được cốt truyện. Điều này giúp giảm áp lực
            tra từ vựng và tập trung vào việc hiểu cấu trúc câu. Quan trọng nhất
            là chọn **chủ đề bạn yêu thích** để duy trì động lực đọc mỗi ngày.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            📚 Áp dụng Kỹ thuật Skimming và Scanning
          </Text>
          <Text style={styles.paragraph}>
            **Skimming (Đọc lướt):** Đọc nhanh tiêu đề, câu mở đầu và câu kết để
            nắm ý chính của toàn bài/đoạn văn. **Scanning (Đọc quét):** Dùng để
            tìm kiếm thông tin cụ thể (tên riêng, ngày tháng, số liệu) mà không
            cần đọc hiểu chi tiết. Luyện tập hai kỹ thuật này giúp bạn xử lý văn
            bản nhanh và hiệu quả hơn.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>📚 Tóm tắt và Kể lại Câu Chuyện</Text>
          <Text style={styles.paragraph}>
            Sau khi đọc xong một đoạn hoặc một chương, hãy dành vài phút **tóm
            tắt nội dung** bằng lời của chính bạn (tốt nhất là viết ra). Điều
            này buộc bạn phải chủ động tái tạo lại kiến thức và áp dụng từ
            vựng/ngữ pháp đã học vào thực tế, từ đó củng cố khả năng ghi nhớ.
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
});
