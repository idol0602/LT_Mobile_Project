import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_BASE } from "../../constants/api";

const SignupScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      Alert.alert(
        "Success",
        "Account created successfully! Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/signIn"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.formContainer,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.title}>Welcome To BearEnglish!</Text>
        <Text style={styles.subtitle}>Create your account to get started</Text>

        {/* Form Inputs */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={18}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={18}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create an account</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By creating an account you agree to our{" "}
          <Text style={styles.linkText}>Terms of Service</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>

        <Text style={styles.loginText}>
          Already got an account?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => {
              router.replace("/(auth)/signIn");
            }}
          >
            Login
          </Text>
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "rgb(38, 39, 48)",
    padding: 35,
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
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    marginBottom: 12,
  },
  socialText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#555",
  },
  orText: {
    color: "#aaa",
    marginHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3c3d47",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 10,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonDisabled: {
    backgroundColor: "#555",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  termsText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  linkText: {
    color: "#4A90E2",
  },
  loginText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 18,
  },
  loginLink: {
    color: "#4A90E2",
    fontWeight: "600",
  },
});

export default SignupScreen;
