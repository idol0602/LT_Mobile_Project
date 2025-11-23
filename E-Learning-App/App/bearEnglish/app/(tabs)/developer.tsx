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
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Code, Github, Coffee, Heart, Star } from "lucide-react-native";

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

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  scaleAnim,
  fadeAnim,
  index,
}) => {
  const pressAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${developer.email}`);
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
        },
      ]}
    >
      <LinearGradient
        colors={
          index % 2 === 0 ? ["#667eea", "#764ba2"] : ["#4CAF50", "#45a049"]
        }
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Image source={developer.image} style={styles.avatar} />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.developerInfo}>
            <Text style={styles.developerName}>{developer.name}</Text>
            <View style={styles.roleContainer}>
              <Code size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.developerRole}>{developer.role}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.developerDescription}>{developer.description}</Text>

        <View style={styles.skillsContainer}>
          <Text style={styles.skillsTitle}>Skills:</Text>
          <View style={styles.skillsGrid}>
            {developer.skills.map((skill, skillIndex) => (
              <View key={skillIndex} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleEmailPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Mail size={18} color="#ffffff" />
          <Text style={styles.contactButtonText}>Contact Developer</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const DeveloperScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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
      email: "nguyenquan06022004@gmail.com",
      image: require("../../assets/images/dev1.jpg"),
      skills: ["React Native", "Node.js", "Firebase"],
    },
    {
      id: 2,
      name: "Thanh Phú",
      role: "UI/UX Designer & Developer",
      description: "Chuyên tạo giao diện đẹp và trực quan cho người dùng.",
      email: "phulam03@gmail.com",
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
  }, [fadeAnim, slideAnim, scaleAnim1, scaleAnim2]);

  // =========================================================
  // MAIN RENDER
  // =========================================================
  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={["#0f0f23", "#16213e"]}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <Coffee size={28} color="#ffffff" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.modernHeaderTitle}>Meet White Bear Team</Text>
            <Text style={styles.modernHeaderSubtitle}>
              White Bear English Developers
            </Text>
          </View>
          <Heart size={24} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Introduction */}
        <Animated.View
          style={[
            styles.introSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#4CAF50", "#45a049"]}
            style={styles.introCard}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.bearEmoji}>🐻‍❄️</Text>
              <Text style={styles.appTitle}>bearEnglish</Text>
            </View>
            <Text style={styles.appSubtitle}>TIẾNG ANH TRONG TẦM TAY</Text>
          </LinearGradient>
        </Animated.View>

        {/* About Section */}
        <Animated.View
          style={[
            styles.aboutSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <Star size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>About bearEnglish</Text>
            </View>
            <Text style={styles.aboutText}>
              bearEnglish là nền tảng học tiếng Anh toàn diện được thiết kế để
              giúp người học ở mọi trình độ nắm vững tiếng Anh. Ứng dụng kết hợp
              các bài học tương tác, AI hỗ trợ và lộ trình cá nhân hóa.
            </Text>
          </View>
        </Animated.View>

        {/* Developers Section */}
        <Animated.View
          style={[styles.developersSection, { opacity: fadeAnim }]}
        >
          <View style={styles.developersHeader}>
            <Github size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Development Team</Text>
          </View>
          <Text style={styles.teamDescription}>
            Meet the talented developers behind bearEnglish 🐻‍❄️
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
          <LinearGradient
            colors={["#0f0f23", "#16213e"]}
            style={styles.footerCard}
          >
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} White Bear English. All rights
              reserved.
            </Text>
            <Text style={styles.versionText}>
              Version 1.0.0 | Built with 🤍 by White Bear Team 🐻‍❄️
            </Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// =========================================================
// STYLES
// =========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    marginBottom: 40,
  },
  modernHeader: {
    paddingTop: 44,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  modernHeaderTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  modernHeaderSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  introSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  introCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  bearEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  aboutSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  aboutCard: {
    backgroundColor: "#2c2c54",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f1f2f6",
  },
  aboutText: {
    fontSize: 15,
    color: "#a4b0be",
    lineHeight: 24,
  },

  developersSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  developersHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  teamDescription: {
    fontSize: 15,
    color: "#a4b0be",
    marginBottom: 20,
    textAlign: "center",
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  developerRole: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },

  developerDescription: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  skillsContainer: {
    marginBottom: 20,
  },
  skillsTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skillText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  contactButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  footerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  footerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
    textAlign: "center",
  },
  versionText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
});

export default DeveloperScreen;
