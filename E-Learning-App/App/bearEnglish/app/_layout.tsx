import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  ThemeProvider,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { StatusBar, AppState, AppStateStatus, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { AuthProvider } from "../contexts/AuthContext";

const GLOBAL_DARK_BACKGROUND = "rgb(38, 39, 48)";
const GLOBAL_TEXT_COLOR = "#FFFFFF";

const CustomFixedDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: GLOBAL_DARK_BACKGROUND,
    card: GLOBAL_DARK_BACKGROUND,
    text: GLOBAL_TEXT_COLOR,
  },
};

const showSystemBars = async () => {
  if (Platform.OS === "android") {
    // Đảm bảo hiển thị thanh điều hướng Android
    await NavigationBar.setVisibilityAsync("visible");
    // Thiết lập hành vi mặc định (tùy chọn)
    await NavigationBar.setBehaviorAsync("inset-swipe");
    await NavigationBar.setBackgroundColorAsync("#000000"); // Đặt màu mặc định
  }
  // Đảm bảo hiển thị thanh trạng thái
  StatusBar.setHidden(false, "fade");
};

const hideSystemBars = async () => {
  if (Platform.OS === "android") {
    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setBehaviorAsync("overlay-swipe");
  }
  await StatusBar.setHidden(true, "fade");
};

export default function RootLayout() {
  useEffect(() => {
    hideSystemBars();

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState.match(/inactive|background/)) {
          showSystemBars();
        } else if (nextAppState === "active") {
          hideSystemBars();
        }
      }
    );

    return () => {
      subscription.remove();
      showSystemBars();
    };
  }, []); // [] đảm bảo effect chỉ chạy 1 lần

  return (
    <AuthProvider>
      <ThemeProvider value={CustomFixedDarkTheme}>
        <StatusBar barStyle="light-content" />

        <Stack initialRouteName="(onboarding)">
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(tips)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(vocabularies)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(reading)" options={{ headerShown: false }} />
          <Stack.Screen name="(listening)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
