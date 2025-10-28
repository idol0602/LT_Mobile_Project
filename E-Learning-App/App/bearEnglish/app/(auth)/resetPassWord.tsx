import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    router.replace("/(auth)/resetSuccess");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Reset your password</Text>

        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✅ Your password has been reset and you can login from here.
          </Text>
        </View>

        <Image
          source={require("../../assets/images/enter_newpassword.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.subTitle}>Enter a new password</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
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
  successText: {
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
  input: {
    backgroundColor: "#444",
    width: "100%",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 8,
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
