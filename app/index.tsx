import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { LoadingScreen } from '../src/components/shared/LoadingScreen';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
