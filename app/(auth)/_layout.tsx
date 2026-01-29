import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { Colors } from '../../src/constants/colors';

export default function AuthLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect authenticated users to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? Colors.gray[900] : Colors.white },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
