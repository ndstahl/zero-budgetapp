import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuth } from '../src/hooks/useAuth';
import { LoadingScreen } from '../src/components/shared/LoadingScreen';
import * as SplashScreen from 'expo-splash-screen';
import { initSentry, Sentry } from '../src/lib/sentry';
import { initAnalytics } from '../src/lib/analytics';
import { ThemeProvider, useResolvedTheme } from '../src/components/ThemeProvider';

// Initialize error tracking and analytics before anything else
initSentry();
initAnalytics();

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function RootLayoutNav() {
  const { isLoading } = useAuth();
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Always render the Stack navigator to maintain navigation context
  // Individual screens/layouts handle auth redirects
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(stacks)"
          options={{ presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Toast />
    </>
  );
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
