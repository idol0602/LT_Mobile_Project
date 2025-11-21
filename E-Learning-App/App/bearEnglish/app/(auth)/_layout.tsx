import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="signIn">
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassWord" options={{ headerShown: false }} />
      <Stack.Screen name="resetPassWord" options={{ headerShown: false }} />
      <Stack.Screen name="resetSuccess" options={{ headerShown: false }} />
      <Stack.Screen name="verifyOTPForgot" options={{ headerShown: false }} />
    </Stack>
  );
}
