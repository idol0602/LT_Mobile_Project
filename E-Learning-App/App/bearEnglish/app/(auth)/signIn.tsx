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
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_BASE } from "../../constants/api";

const SignIn: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Log toàn bộ response để debug
      console.log("Login response:", JSON.stringify(data, null, 2));

      // Kiểm tra structure của response
      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token || !user) {
        console.warn("Token or user missing in response:", data);
      }

      // Hiển thị success message
      // const userName = user?.name || email.split("@")[0];
      // Alert.alert("Success", `Welcome back, ${userName}!`, [
      //   {
      //     text: "OK",
      //     onPress: () => router.replace("/(tabs)"),
      //   },
      // ]);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick-login
  const handleUseDemo = async () => {
    setEmail("demo@bearenglish.com");
    setPassword("demo123");
    // Auto login with demo credentials
    setTimeout(() => {
      handleLogin();
    }, 300);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.formContainer,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/bearWellCome.gif")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bear English</Text>
        </View>

        {/* Input fields */}
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
            placeholder="Password"
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

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Demo account quick login */}
        <TouchableOpacity style={styles.demoButton} onPress={handleUseDemo}>
          <Text style={styles.demoText}>Use demo account</Text>
        </TouchableOpacity>

        {/* Forgot password */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot your password? </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgotPassWord")}
          >
            <Text style={styles.linkText}>Reset your password</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.socialText}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Are you not registered? </Text>
          <TouchableOpacity
            onPress={() => {
              router.replace("/(auth)/signUp");
            }}
          >
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default SignIn;

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
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 300,
    height: 150,
  },
  title: {
    color: "#4A90E2",
    fontSize: 26,
    fontWeight: "700",
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
  loginButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#555",
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  demoButton: {
    backgroundColor: "#28a745",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  demoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  forgotPasswordText: {
    color: "#aaa",
    fontSize: 13,
  },
  linkText: {
    color: "#4A90E2",
    fontSize: 13,
    fontWeight: "500",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  registerText: {
    color: "#aaa",
    fontSize: 14,
  },
});
