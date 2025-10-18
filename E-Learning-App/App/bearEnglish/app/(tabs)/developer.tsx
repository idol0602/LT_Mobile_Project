import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

// =========================================================
// 1. ĐỊNH NGHĨA INTERFACE
// =========================================================

// Interface cho cấu trúc dữ liệu của một Developer
interface Developer {
  id: number;
  name: string;
  role: string;
  description: string;
  email: string;
  image: string; // URL của ảnh
  skills: string[];
}

// Interface cho Props của component DeveloperCard
interface DeveloperCardProps {
  developer: Developer;
  scaleAnim: Animated.Value;
  // fadeAnim được sử dụng trong DeveloperCard, nhưng nó là biến local trong DeveloperScreen,
  // nên cần được truyền vào.
  fadeAnim: Animated.Value; 
}

// =========================================================
// 2. COMPONENT CHÍNH
// =========================================================

const DeveloperScreen = () => {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim1 = new Animated.Value(0.8);
  const scaleAnim2 = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

  // Khai báo kiểu tường minh cho developers (mảng các Developer)
  const developers: Developer[] = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Lead Developer',
      description: 'Full-stack developer với 5+ năm kinh nghiệm phát triển ứng dụng di động',
      email: 'nguyenvana@bearenglish.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      skills: ['React Native', 'Node.js', 'Firebase'],
    },
    {
      id: 2,
      name: 'Trần Thị B',
      role: 'UI/UX Designer & Developer',
      description: 'Chuyên tạo giao diện đẹp và trực quan cho người dùng',
      email: 'tranthib@bearenglish.com',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      skills: ['UI Design', 'React Native', 'Animation'],
    },
  ];

  useEffect(() => {
    // Staggered animations setup...
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(scaleAnim1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // SỬA LỖI: Áp dụng DeveloperCardProps cho component
  const DeveloperCard = ({ developer, scaleAnim, fadeAnim }: DeveloperCardProps) => {
    const pressAnim = new Animated.Value(1);
    const imageScaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const handleImageHover = () => {
      Animated.spring(imageScaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    };

    const handleImageOut = () => {
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.developerCard,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, pressAnim) },
              ],
              opacity: fadeAnim, // Lỗi đã được khắc phục vì fadeAnim giờ là props
            },
          ]}
        >
          {/* ... Phần nội dung còn lại giữ nguyên ... */}
          <Pressable
            onPressIn={handleImageHover}
            onPressOut={handleImageOut}
          >
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [{ scale: imageScaleAnim }],
                },
              ]}
            >
              <Image
                source={{ uri: developer.image }}
                style={styles.developerImage}
              />
              <View style={styles.imageOverlay}>
                <Text style={styles.overlayText}>{developer.role}</Text>
              </View>
            </Animated.View>
          </Pressable>

          <View style={styles.cardContent}>
            <View style={styles.nameSection}>
              <Text style={styles.developerName}>{developer.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{developer.role}</Text>
              </View>
            </View>

            <Text style={styles.developerDescription}>
              {developer.description}
            </Text>

            <View style={styles.skillsContainer}>
              {developer.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            <View style={styles.emailSection}>
              <Text style={styles.emailLabel}>Email:</Text>
              <Text style={styles.developerEmail}>{developer.email}</Text>
            </View>
          </View>

          <View style={styles.accentLine} />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section... (sử dụng fadeAnim và slideAnim) */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.appTitle,
            {
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          bearEnglish
        </Animated.Text>
        <Text style={styles.appSubtitle}>Learn English, Speak Confidently</Text>
      </Animated.View>

      {/* About Section... (sử dụng fadeAnim và slideAnim) */}
      <Animated.View
        style={[
          styles.aboutSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Về Ứng Dụng</Text>
        <Text style={styles.aboutText}>
          bearEnglish là nền tảng học tiếng Anh toàn diện được thiết kế để giúp
          người học ở mọi trình độ nắm vững tiếng Anh. Ứng dụng của chúng tôi
          kết hợp các bài học tương tác, phản hồi phát âm thời gian thực và các
          đường học tập được cá nhân hóa.
        </Text>
      </Animated.View>

      {/* Features Section... (sử dụng fadeAnim và slideAnim) */}
      <Animated.View
        style={[
          styles.featuresSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Tính Năng Chính</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Bài học tương tác với các tình huống thực tế
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>
            Sửa lỗi phát âm được hỗ trợ bởi AI
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Đường học tập được cá nhân hóa</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>Thử thách hàng ngày và phần thưởng</Text>
        </View>
      </Animated.View>

      {/* Developers Section - Main Highlight */}
      <Animated.View
        style={[
          styles.developersSection,
          {
            opacity: fadeAnim, // Dùng fadeAnim
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Đội Phát Triển Của Chúng Tôi</Text>
        <Text style={styles.teamDescription}>
          Gặp gỡ những người tài năng đằng sau bearEnglish
        </Text>
        {/* Truyền thêm fadeAnim vào DeveloperCard */}
        <DeveloperCard
          developer={developers[0]}
          scaleAnim={scaleAnim1}
          fadeAnim={fadeAnim} 
        />
        <DeveloperCard
          developer={developers[1]}
          scaleAnim={scaleAnim2}
          fadeAnim={fadeAnim}
        />
      </Animated.View>

      {/* Footer Section */}
      <Animated.View
        style={[
          styles.footerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.footerText}>
          Được tạo ra với đam mê bởi đội ngũ bearEnglish
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </ScrollView>
  );
};

// ... (phần styles giữ nguyên)
// ... (Bạn nên đặt phần styles vào một file riêng hoặc trước DeveloperScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(38, 39, 48)',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2196F3',
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 22,
    marginBottom: 12,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureBullet: {
    fontSize: 18,
    color: '#2196F3',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: '#D0D0D0',
    flex: 1,
    lineHeight: 20,
  },
  developersSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    marginVertical: 20,
  },
  teamDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  developerCard: {
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  developerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  overlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 20,
  },
  nameSection: {
    marginBottom: 12,
  },
  developerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  developerDescription: {
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 22,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  skillBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.4)',
  },
  skillText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 150, 243, 0.2)',
  },
  emailLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginRight: 8,
    fontWeight: '600',
  },
  developerEmail: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  accentLine: {
    height: 3,
    // Cảnh báo: Thuộc tính này không hoạt động trong React Native (React Native không hỗ trợ CSS linear-gradient)
    // Bạn nên dùng 'backgroundColor: #2196F3' hoặc thư viện phụ trợ (như react-native-linear-gradient)
    backgroundColor: '#2196F3', // Đổi thành màu solid để tránh lỗi
    width: '100%',
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2196F3',
  },
  footerText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#707070',
  },
});

export default DeveloperScreen;