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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const SignIn: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  // Thêm state cho email & password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    // Giả lập thông tin đăng nhập
    if (email === "admin" && password === "123") {
      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", "Invalid username or password.");
    }
  };

  // Demo account quick-login
  const handleUseDemo = () => {
    const demoEmail = "admin";
    const demoPassword = "123";
    // fill fields for visibility
    setEmail(demoEmail);
    setPassword(demoPassword);
    // perform the same login behaviour
    Alert.alert("Success", "Login successful!");
    router.replace("/(tabs)");
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
            placeholder="Username"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
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
