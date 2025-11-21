import React, { useRef, useState } from "react";
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

const NewPasswordScreen = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const resetToken = params.resetToken as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetButtonScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;

  const passwordRequirements = [
    { text: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { text: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { text: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { text: "Contains number", test: (p: string) => /[0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRequirements.every((req) =>
    req.test(password)
  );
  const doPasswordsMatch = password === confirmPassword && password !== "";

  const handleResetPress = async () => {
    if (!isPasswordValid) {
      Alert.alert("Error", "Password doesn't meet all requirements");
      return;
    }

    if (!doPasswordsMatch) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    Animated.sequence([
      Animated.spring(resetButtonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(resetButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      const response = await API.resetPassword(email, resetToken, password);

      if (response.success) {
        Alert.alert("Success", "Password has been reset successfully", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/login");
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      Alert.alert("Error", "Failed to reset password. Please try again.");
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
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={60} color="#2563eb" />
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Create New Password</Text>
          <Text style={styles.contentDescription}>
            Your new password must be different from previously used passwords
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8a8b97"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#5a5b67"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#8a8b97"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          {passwordRequirements.map((req, index) => {
            const isMet = req.test(password);
            return (
              <View key={index} style={styles.requirementItem}>
                <Ionicons
                  name={isMet ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={isMet ? "#10b981" : "#5a5b67"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    isMet && styles.requirementTextMet,
                  ]}
                >
                  {req.text}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8a8b97"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#5a5b67"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#8a8b97"
              />
            </TouchableOpacity>
          </View>
          {confirmPassword !== "" && !doPasswordsMatch && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>Passwords don't match</Text>
            </View>
          )}
          {doPasswordsMatch && confirmPassword !== "" && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.successText}>Passwords match</Text>
            </View>
          )}
        </View>

        <Animated.View style={{ transform: [{ scale: resetButtonScale }] }}>
          <TouchableOpacity
            onPress={handleResetPress}
            activeOpacity={0.8}
            style={[
              styles.resetButton,
              (!isPasswordValid || !doPasswordsMatch || loading) &&
                styles.resetButtonDisabled,
            ]}
            disabled={!isPasswordValid || !doPasswordsMatch || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
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
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a4b57",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5a5b67",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  requirementsContainer: {
    backgroundColor: "#4a4b57",
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: "#8a8b97",
  },
  requirementTextMet: {
    color: "#10b981",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  successText: {
    fontSize: 13,
    color: "#10b981",
  },
  resetButton: {
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
    marginTop: 8,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default NewPasswordScreen;
