import React, { useRef, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import API from "../../api";

const VerifyOTPForgotScreen = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const devOTP = params.otp as string;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const verifyButtonScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (devOTP) {
      console.log("📧 Development OTP:", devOTP);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);

      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPress = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter complete OTP");
      return;
    }

    Animated.sequence([
      Animated.spring(verifyButtonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(verifyButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      const response = await API.verifyOTP(email, otpCode);

      if (response.success) {
        setTimeout(() => {
          router.push({
            pathname: "/(auth)/resetPassWord",
            params: {
              email,
              resetToken: response.resetToken,
            },
          });
        }, 500);
      } else {
        Alert.alert("Error", response.message || "Invalid OTP");

        if (response.remainingAttempts !== undefined) {
          Alert.alert(
            "Warning",
            `${response.remainingAttempts} attempts remaining`
          );
        }

        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResending(true);

    try {
      const response = await API.resendOTP(email);

      if (response.success) {
        Alert.alert("Success", "OTP has been resent to your email");

        if (response.otp) {
          console.log("📧 New OTP:", response.otp);
        }

        setCountdown(300);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert("Error", response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
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
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={60} color="#2563eb" />
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Enter OTP Code</Text>
          <Text style={styles.contentDescription}>
            We've sent a 6-digit code to
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleOTPChange(index, value)}
              onKeyPress={({ nativeEvent: { key } }) =>
                handleKeyPress(index, key)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#8a8b97" />
          <Text style={styles.timerText}>
            {countdown > 0 ? formatTime(countdown) : "Expired"}
          </Text>
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={!canResend || resending}
          >
            <Text
              style={[
                styles.resendLink,
                (!canResend || resending) && styles.resendLinkDisabled,
              ]}
            >
              {resending ? "Sending..." : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ transform: [{ scale: verifyButtonScale }] }}>
          <TouchableOpacity
            onPress={handleVerifyPress}
            activeOpacity={0.8}
            style={[
              styles.verifyButton,
              loading && styles.verifyButtonDisabled,
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
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
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#4a4b57",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(37, 99, 235, 0.3)",
  },
  contentSection: {
    alignItems: "center",
    marginBottom: 40,
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
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 60,
    backgroundColor: "#4a4b57",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5a5b67",
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#2563eb",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 16,
    color: "#8a8b97",
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#8a8b97",
  },
  resendLink: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: "#5a5b67",
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default VerifyOTPForgotScreen;
