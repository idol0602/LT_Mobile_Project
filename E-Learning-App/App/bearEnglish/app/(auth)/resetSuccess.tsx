import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";

const ResetSuccessScreen = () => {
  const handleGoLogin = () => {
    router.replace("/(auth)/signIn");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Password Reset Successful!</Text>

        <Image
          source={require("../../assets/images/resetSuccess.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.message}>
          Your password has been reset successfully. You can now log in with
          your new password.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGoLogin}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "85%",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 25,
  },
  message: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
