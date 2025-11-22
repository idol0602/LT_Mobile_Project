import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import API from "../../api";
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      Alert.alert("Error", "New password doesn't meet all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from current password"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await API.changePassword(currentPassword, newPassword);

      if (response.success) {
        Alert.alert("Success", "Password changed successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#0f0f23", "#16213e", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Security Icon */}
          <View style={styles.iconSection}>
            <LinearGradient
              colors={["#00d4ff", "#0099ff"]}
              style={styles.iconContainer}
            >
              <Ionicons name="shield-checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.iconText}>🔐 Secure your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#a4b0be"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#a4b0be"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#a4b0be"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#a4b0be"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            {newPassword !== "" && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                {passwordRequirements.map((req, index) => {
                  const isMet = req.test(newPassword);
                  return (
                    <View key={index} style={styles.requirementItem}>
                      <Ionicons
                        name={isMet ? "checkmark-circle" : "ellipse-outline"}
                        size={16}
                        color={isMet ? "#10b981" : "#a4b0be"}
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
            )}

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#a4b0be"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#a4b0be"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword !== "" && (
                <View style={styles.matchIndicator}>
                  {doPasswordsMatch ? (
                    <View style={styles.matchSuccess}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#10b981"
                      />
                      <Text style={styles.matchSuccessText}>
                        Passwords match
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.matchError}>
                      <Ionicons name="close-circle" size={16} color="#ef4444" />
                      <Text style={styles.matchErrorText}>
                        Passwords don&apos;t match
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[
              styles.changeButton,
              (!isPasswordValid ||
                !doPasswordsMatch ||
                !currentPassword ||
                loading) &&
                styles.changeButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={
              !isPasswordValid ||
              !doPasswordsMatch ||
              !currentPassword ||
              loading
            }
          >
            <LinearGradient
              colors={
                !isPasswordValid ||
                !doPasswordsMatch ||
                !currentPassword ||
                loading
                  ? ["#666", "#444"]
                  : ["#00d4ff", "#0099ff"]
              }
              style={styles.changeGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="key" size={20} color="#fff" />
                  <Text style={styles.changeButtonText}>Change Password</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    paddingTop: 50,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconText: {
    fontSize: 16,
    color: "#f1f2f6",
    fontWeight: "500",
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f2f6",
    marginBottom: 8,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "#2c2c54",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: "#f1f2f6",
    borderWidth: 1,
    borderColor: "#40407a",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 17,
  },
  requirementsContainer: {
    backgroundColor: "#2c2c54",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#40407a",
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f1f2f6",
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#a4b0be",
  },
  requirementTextMet: {
    color: "#10b981",
  },
  matchIndicator: {
    marginTop: 8,
  },
  matchSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchSuccessText: {
    fontSize: 13,
    color: "#10b981",
  },
  matchError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchErrorText: {
    fontSize: 13,
    color: "#ef4444",
  },
  changeButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
