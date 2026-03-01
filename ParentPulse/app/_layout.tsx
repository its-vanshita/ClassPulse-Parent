import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { StudentProvider } from '@/src/context/StudentContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

/** Inner layout that has access to auth state. */
function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user, loading, isDemo } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthScreen = segments[0] === 'login';
    if (!user && !isDemo && !inAuthScreen) {
      router.replace('/login');
    } else if ((user || isDemo) && inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [user, isDemo, loading, segments]);

  return (
    <StudentProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="homework"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="login"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StudentProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
