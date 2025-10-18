import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';

const GLOBAL_DARK_BACKGROUND = 'rgb(38, 39, 48)';
const GLOBAL_TEXT_COLOR = '#FFFFFF';

const CustomFixedDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: GLOBAL_DARK_BACKGROUND, 
    card: GLOBAL_DARK_BACKGROUND, 
    text: GLOBAL_TEXT_COLOR, 
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomFixedDarkTheme}>
      <StatusBar barStyle="light-content" /> 
      
      <Stack initialRouteName='(onboarding)'>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}