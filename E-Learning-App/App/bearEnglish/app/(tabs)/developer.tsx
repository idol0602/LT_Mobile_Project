import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Image,
  Linking,
  ImageBackground,
} from "react-native";

const { width } = Dimensions.get("window");

// Tạo Animated component cho ImageBackground
const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

interface Developer {
  id: number;
  name: string;
  role: string;
  description: string;
  email: string;
  image: any;
  skills: string[];
}

interface DeveloperCardProps {
  developer: Developer;
  scaleAnim: Animated.Value;
  fadeAnim: Animated.Value;
  index: number;
}

const DeveloperScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scrollAnim = React.useRef(new Animated.Value(0)).current;

  // Animation scale riêng cho từng card
  const scaleAnim1 = React.useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = React.useRef(new Animated.Value(0.8)).current;

  const developers: Developer[] = [
    {
      id: 1,
      name: "Nguyễn Quân",
      role: "Lead Developer",
      description:
        "Full-stack developer với 5+ năm kinh nghiệm phát triển ứng dụng di động.",
      email: "nguyenvana@bearenglish.com",
      image: require("../../assets/images/dev1.jpg"),
      skills: ["React Native", "Node.js", "Firebase"],
    },
    {
      id: 2,
      name: "Thanh Phú",
      role: "UI/UX Designer & Developer",
      description: "Chuyên tạo giao diện đẹp và trực quan cho người dùng.",
      email: "tranthib@bearenglish.com",
      image: require("../../assets/images/dev2.jpg"),
      skills: ["UI Design", "React Native", "Animation"],
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
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
      ]),
    ]).start();
  }, []);

  const headerTranslateY = scrollAnim.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  const imageScale = scrollAnim.interpolate({
    inputRange: [0, 400],
    outputRange: [1, 1.2],
    extrapolate: "clamp",
  });

  const DeveloperCard = ({
    developer,
    scaleAnim,
    fadeAnim,
  }: DeveloperCardProps) => {
    const pressAnim = React.useRef(new Animated.Value(1)).current;
    const imageScaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleImageHoverIn = () => {
      Animated.spring(imageScaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    };

    const handleImageHoverOut = () => {
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const handleEmailPress = () => {
      Linking.openURL(`mailto:${developer.email}`);
    };

    return (
      <Pressable
        onPress={handleEmailPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.developerCard,
            {
              transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable
            onPressIn={handleImageHoverIn}
            onPressOut={handleImageHoverOut}
          >
            <Animated.View
              style={[
                styles.avatarContainer,
                { transform: [{ scale: imageScaleAnim }] },
              ]}
            >
              <Image source={developer.image} style={styles.developerImage} />
              <View style={styles.imageInfoOverlay}>
                <Text style={styles.overlayName}>{developer.name}</Text>
                <Text style={styles.overlayRole}>{developer.role}</Text>
              </View>
            </Animated.View>
          </Pressable>

          <View style={styles.cardContent}>
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

            <Pressable onPress={handleEmailPress} style={styles.emailSection}>
              <Text style={styles.emailLabel}>Email:</Text>
              <Text style={styles.developerEmail}>{developer.email}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  // =========================================================
  // MAIN RENDER
  // =========================================================
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: imageScale }] }}>
      <AnimatedImageBackground
        source={require("../../assets/images/iceland2.jpg")}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.darkOverlay} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            scrollAnim.setValue(y);
          }}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: headerTranslateY }],
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
            <View style={styles.separator} />
            <Text style={styles.appSubtitle}>HỌC TIẾNG ANH, NÓI TỰ TIN</Text>
          </Animated.View>

          {/* About */}
          <Animated.View
            style={[
              styles.aboutSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>VỀ ỨNG DỤNG</Text>
            <Text style={styles.aboutText}>
              bearEnglish là nền tảng học tiếng Anh toàn diện được thiết kế để
              giúp người học ở mọi trình độ nắm vững tiếng Anh. Ứng dụng của
              chúng tôi kết hợp các bài học tương tác, phản hồi phát âm thời
              gian thực và lộ trình cá nhân hóa.
            </Text>
          </Animated.View>

          {/* Developers */}
          <Animated.View
            style={[styles.developersSection, { opacity: fadeAnim }]}
          >
            <Text style={styles.sectionTitle}>ĐỘI PHÁT TRIỂN</Text>
            <Text style={styles.teamDescription}>
              Gặp gỡ những người tài năng đằng sau bearEnglish
            </Text>
            <DeveloperCard
              developer={developers[0]}
              scaleAnim={scaleAnim1}
              fadeAnim={fadeAnim}
              index={0}
            />
            <DeveloperCard
              developer={developers[1]}
              scaleAnim={scaleAnim2}
              fadeAnim={fadeAnim}
              index={1}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footerSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} bearEnglish. All rights reserved.
            </Text>
            <Text style={styles.versionText}>
              Version 1.0.0 | Built with passion
            </Text>
          </Animated.View>
        </ScrollView>
      </AnimatedImageBackground>
    </Animated.View>
  );
};

// =========================================================
// STYLES
// =========================================================
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  imageStyle: {
    resizeMode: "cover",
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },

  headerSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginBottom: 16,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 212, 255, 0.3)",
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#00D4FF",
    marginBottom: 4,
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 212, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  separator: {
    height: 2,
    width: "30%",
    backgroundColor: "#00D4FF",
    marginVertical: 8,
    borderRadius: 1,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    fontWeight: "600",
    letterSpacing: 1,
  },

  aboutSection: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(42, 42, 58, 0.8)",
    marginHorizontal: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#00D4FF",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aboutText: {
    fontSize: 14,
    color: "#D0D0D0",
    lineHeight: 22,
  },

  developersSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
  },
  teamDescription: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 25,
    paddingHorizontal: 5,
  },

  developerCard: {
    backgroundColor: "rgba(42, 42, 58, 0.8)",
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    overflow: "hidden",
  },
  avatarContainer: {
    width: "100%",
    height: 250,
    overflow: "hidden",
    position: "relative",
    borderBottomWidth: 3,
    borderColor: "rgba(0, 212, 255, 0.5)",
  },
  developerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  overlayName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 212, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  overlayRole: {
    fontSize: 15,
    fontWeight: "600",
    color: "#00D4FF",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 20,
  },
  developerDescription: {
    fontSize: 14,
    color: "#D0D0D0",
    lineHeight: 22,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 15,
  },
  skillBadge: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  skillText: {
    fontSize: 12,
    color: "#00D4FF",
    fontWeight: "600",
  },
  emailSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
  },
  emailLabel: {
    fontSize: 14,
    color: "#A0A0A0",
    marginRight: 8,
    fontWeight: "600",
  },
  developerEmail: {
    fontSize: 14,
    color: "#00D4FF",
    fontWeight: "500",
  },

  footerSection: {
    alignItems: "center",
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 20,
    backgroundColor: "rgba(30, 30, 44, 0.7)",
  },
  footerText: {
    fontSize: 13,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: "#707070",
  },
});

export default DeveloperScreen;
