import React, { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import API from "../../api";

const { width } = Dimensions.get("window");

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;

  const handleSendPress = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    Animated.sequence([
      Animated.spring(sendButtonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      const response = await API.forgotPassword(email.trim().toLowerCase());

      if (response.success) {
        setShowSuccess(true);

        // Navigate to OTP verification screen
        setTimeout(() => {
          router.push({
            pathname: "/(auth)/verifyOTPForgot" as any,
            params: {
              email: email.trim().toLowerCase(),
              otp: response.otp, // Only for development
            },
          });
        }, 1500);
      } else {
        Alert.alert("Error", response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    Animated.sequence([
      Animated.spring(backButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(backButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/(auth)/signIn");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                <Ionicons name="arrow-back" />
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.headerTitle}>Forgotten your Password?</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Success Message */}
        {showSuccess && (
          <View style={styles.messageContainer}>
            <View style={styles.messageContent}>
              <Text style={styles.messageIcon}>✓</Text>
              <Text style={styles.messageText}>
                An OTP has been sent to your email. Please check your inbox.
              </Text>
            </View>
          </View>
        )}

        <Image
          source={require("../../assets/images/dont_worry.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Don't worry</Text>
          <Text style={styles.contentDescription}>
            Please enter the address associated with your account
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>
              <Ionicons name="mail-outline" color={"#ffffff"} size={20} />
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8a8b97"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={true}
            />
          </View>
        </View>

        {/* Send Button */}
        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <TouchableOpacity
            onPress={handleSendPress}
            activeOpacity={0.8}
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.sendButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#4a4b57",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 32,
  },
  messageContent: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  messageIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  messageText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  illustration: {
    alignItems: "center",
    position: "relative",
  },
  illustrationEmoji: {
    fontSize: 120,
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: -20,
    marginLeft: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: "#8a8b97",
    textAlign: "center",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a4b57",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#5a5b67",
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  sendButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logo: {
    width: 300,
    height: 150,
  },
});

export default ForgotPasswordScreen;
