import { useColorScheme } from 'react-native';
import { useThemeStore, type ResolvedTheme } from '../stores/themeStore';
import { colorScheme } from 'nativewind';

export function useResolvedTheme(): ResolvedTheme {
  const systemTheme = useColorScheme();
  const { theme } = useThemeStore();

  if (theme === 'system') {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolvedTheme = useResolvedTheme();

  // Set NativeWind color scheme
  colorScheme.set(resolvedTheme);

  return <>{children}</>;
}
