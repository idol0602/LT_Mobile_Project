import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../api";

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const resetToken = params.resetToken as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetButtonScale = useRef(new Animated.Value(1)).current;

  const passwordRequirements = [
    { text: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { text: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { text: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { text: "Contains number", test: (p: string) => /[0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRequirements.every((req) =>
    req.test(newPassword)
  );
  const doPasswordsMatch =
    newPassword === confirmPassword && newPassword !== "";

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!isPasswordValid) {
      Alert.alert("Error", "Password doesn't meet all requirements");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
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
      const response = await API.resetPassword(email, resetToken, newPassword);

      if (response.success) {
        Alert.alert("Success", "Password has been reset successfully", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/resetSuccess");
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Reset your password</Text>

        <View style={styles.successBox}>
          <Text style={styles.successBoxText}>
            ✅ Your password has been reset and you can login from here.
          </Text>
        </View>

        <Image
          source={require("../../assets/images/enter_newpassword.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.subTitle}>Enter a new password</Text>

        <View style={styles.passwordRequirementsBox}>
          <Text style={styles.requirementsTitle}>Password must have:</Text>
          {passwordRequirements.map((req, index) => {
            const isMet = req.test(newPassword);
            return (
              <View key={index} style={styles.requirementItem}>
                <Ionicons
                  name={isMet ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={isMet ? "#10b981" : "#888"}
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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#ccc"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#ccc"
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

        <Animated.View style={{ transform: [{ scale: resetButtonScale }] }}>
          <TouchableOpacity
            style={[
              styles.button,
              (!isPasswordValid || !doPasswordsMatch || loading) &&
                styles.buttonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={!isPasswordValid || !doPasswordsMatch || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "rgb(38, 39, 48)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  innerContainer: {
    width: "85%",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: "#1E90FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: "100%",
  },
  successBoxText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  image: {
    width: 220,
    height: 220,
    marginVertical: 20,
  },
  subTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputContainer: {
    width: "100%",
    position: "relative",
    marginVertical: 8,
  },
  input: {
    backgroundColor: "#444",
    width: "100%",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingRight: 50,
    color: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 12,
    padding: 5,
  },
  passwordRequirementsBox: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: "100%",
  },
  requirementsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#888",
  },
  requirementTextMet: {
    color: "#10b981",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  successText: {
    fontSize: 13,
    color: "#10b981",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
