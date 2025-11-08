import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
const DELAY_TIME = 2000;
const { width } = Dimensions.get("window");

export default function Welcome() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/signUp");
    }, DELAY_TIME);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(38, 39, 48)" />
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Image
            source={require("../../assets/images/bearWellCome.gif")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome to BearEnglish</Text>

        <Text style={styles.subtitle}>
          Learn English with your friendly bear companion
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(38, 39, 48)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  imagePlaceholder: {
    width: width * 1,
    height: width * 1,

    overflow: "hidden",
    elevation: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#2196F3",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(27, 153, 232, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#2196F3",
    textAlign: "center",
    lineHeight: 28,
    letterSpacing: 0.6,
    opacity: 0.9,
    maxWidth: "90%",
  },
});
