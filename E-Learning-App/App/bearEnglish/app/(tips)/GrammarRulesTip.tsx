import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

// Mẹo 4: Grammar Rules
export default function GrammarRulesTip() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/learning-tip4.jpg")}
          style={styles.tipImage}
        />
        <Text style={styles.title}>
          Làm Chủ Ngữ Pháp Tiếng Anh: Bắt Đầu Từ Nền Tảng
        </Text>
        {/* ... (Nội dung còn lại) ... */}
        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            📝 Bắt đầu với Cấu trúc Câu Đơn Giản
          </Text>
          <Text style={styles.paragraph}>
            Với người mới, hãy tập trung vào cấu trúc câu cơ bản: **Chủ ngữ (S)
            + Động từ (V) + Tân ngữ (O)**. Đừng cố gắng học những cấu trúc phức
            tạp ngay từ đầu. Song song đó, nắm vững 3 phần kiến thức nền tảng
            quan trọng nhất: **Các Thì cơ bản** (Hiện tại đơn, Quá khứ đơn,
            Tương lai đơn), **Các Từ Loại** (danh từ, động từ, tính từ, trạng
            từ), và **Cấu tạo từ** (tiếp đầu ngữ, tiếp vị ngữ).
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            📝 Học Ngữ Pháp thông qua Ví Dụ và Thực Hành
          </Text>
          <Text style={styles.paragraph}>
            Đừng học các quy tắc khô khan. Thay vào đó, hãy học qua các **câu
            mẫu (example sentences)** thông dụng và cố gắng áp dụng nó ngay lập
            tức. Luyện tập bằng cách **viết** (viết nhật ký, email ngắn) và
            **nói** (đặt câu hỏi, trả lời) thường xuyên. Việc áp dụng giúp biến
            kiến thức lý thuyết thành kỹ năng phản xạ.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.heading}>
            📝 Đọc Sách và Xem Phim để 'Ngấm' Ngữ Pháp
          </Text>
          <Text style={styles.paragraph}>
            Đọc nhiều sách, truyện, báo chí hoặc xem phim bằng tiếng Anh sẽ giúp
            bạn tiếp xúc với ngữ pháp một cách tự nhiên trong ngữ cảnh. Khi bạn
            thấy một cấu trúc câu hay hoặc lạ, hãy ghi chú lại để phân tích,
            thay vì chỉ cố gắng nhớ luật. Việc này giúp bạn xây dựng "cảm giác"
            về ngôn ngữ.
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
