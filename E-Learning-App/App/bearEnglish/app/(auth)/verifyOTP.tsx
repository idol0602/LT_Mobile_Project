import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { API_BASE } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";

const VerifyOTPScreen: React.FC = () => {
  const { email, fullName } = useLocalSearchParams();
  const { login } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.spring(translateY, {
      toValue: 0,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Focus vào ô đầu tiên
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xác nhận OTP thất bại");
      }

      // Lưu thông tin user và token
      if (data.data?.user && data.data?.token) {
        await login(data.data.user, data.data.token);

        Alert.alert(
          "Thành công",
          "Xác nhận OTP thành công! Chào mừng bạn đến với BearEnglish.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Alert.alert(
        "Xác nhận thất bại",
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi xác nhận OTP"
      );
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      setResending(true);

      const response = await fetch(`${API_BASE}/api/users/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gửi lại OTP thất bại");
      }

      Alert.alert("Thành công", "Mã OTP mới đã được gửi đến email của bạn");
      setCountdown(60); // 60 giây countdown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);
      Alert.alert(
        "Gửi lại thất bại",
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi gửi lại OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={64} color="#4A90E2" />
        </View>

        <Text style={styles.title}>Xác nhận Email</Text>
        <Text style={styles.subtitle}>Chúng tôi đã gửi mã OTP đến email</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.description}>
          Vui lòng nhập mã 6 số để xác nhận tài khoản
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                loading && styles.otpInputDisabled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Không nhận được mã? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resending || countdown > 0}
          >
            <Text
              style={[
                styles.resendLink,
                (resending || countdown > 0) && styles.resendLinkDisabled,
              ]}
            >
              {resending
                ? "Đang gửi..."
                : countdown > 0
                ? `Gửi lại (${countdown}s)`
                : "Gửi lại"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to signup */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#4A90E2" />
          <Text style={styles.backText}>Quay lại đăng ký</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  content: {
    flex: 1,
    padding: 35,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  email: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#3c3d47",
    borderWidth: 2,
    borderColor: "#555",
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#4A90E2",
    backgroundColor: "#444",
  },
  otpInputDisabled: {
    opacity: 0.5,
  },
  verifyButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: "#555",
  },
  verifyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resendText: {
    color: "#aaa",
    fontSize: 14,
  },
  resendLink: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: "#666",
  },
  backButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default VerifyOTPScreen;
