import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useThemeStore, type ThemePreference } from '../../../src/stores/themeStore';
import { useResolvedTheme } from '../../../src/components/ThemeProvider';
import { Card } from '../../../src/components/ui/Card';
import { Check, Monitor, Sun, Moon } from 'lucide-react-native';

type ThemeOption = {
  key: ThemePreference;
  label: string;
  description: string;
  icon: React.ReactNode;
};

export default function AppearanceScreen() {
  const { theme, setTheme } = useThemeStore();
  const resolvedTheme = useResolvedTheme();

  const themeOptions: ThemeOption[] = [
    {
      key: 'system',
      label: 'System',
      description: 'Follow your device settings',
      icon: <Monitor color="#9CA3AF" size={22} />,
    },
    {
      key: 'light',
      label: 'Light',
      description: 'Always use light mode',
      icon: <Sun color="#F59E0B" size={22} />,
    },
    {
      key: 'dark',
      label: 'Dark',
      description: 'Always use dark mode',
      icon: <Moon color="#6366F1" size={22} />,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <Stack.Screen options={{ title: 'Appearance' }} />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Theme
        </Text>

        <Card padding="none" className="mb-6">
          {themeOptions.map((option, index) => (
            <Pressable
              key={option.key}
              onPress={() => setTheme(option.key)}
              className={`flex-row items-center px-4 py-4 active:bg-gray-50 dark:active:bg-gray-700 ${
                index < themeOptions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
            >
              <View className="mr-3">{option.icon}</View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {option.label}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </Text>
              </View>
              {theme === option.key && (
                <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-500">
                  <Check color="#FFFFFF" size={14} />
                </View>
              )}
            </Pressable>
          ))}
        </Card>

        {/* Current Theme Preview */}
        <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Preview
        </Text>

        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900">
              {resolvedTheme === 'dark' ? (
                <Moon color="#818CF8" size={24} />
              ) : (
                <Sun color="#F59E0B" size={24} />
              )}
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Currently active
              </Text>
            </View>
          </View>
        </Card>

        <Text className="text-center text-sm text-gray-400 dark:text-gray-500">
          {theme === 'system'
            ? 'Your app will automatically switch between light and dark mode based on your device settings.'
            : `Your app will always use ${theme} mode, regardless of your device settings.`}
        </Text>
      </View>
    </SafeAreaView>
  );
}
