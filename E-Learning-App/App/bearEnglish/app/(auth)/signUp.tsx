import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const SignupScreen: React.FC = () => {
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
  }, []);

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

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.socialText}>Sign up with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* Form Inputs */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color="#aaa" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {/* Create Account Button */}
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create an account</Text>
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
