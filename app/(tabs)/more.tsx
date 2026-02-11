import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { authService } from '../../src/services/auth.service';
import { Card } from '../../src/components/ui/Card';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Link2,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Users,
  Target,
  Receipt,
  Zap,
  DollarSign,
  Repeat,
  Info,
  Palette,
} from 'lucide-react-native';

export default function MoreScreen() {
  const profile = useAuthStore((s) => s.profile);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.signOut();
            useAuthStore.getState().reset();
            router.replace('/(auth)/welcome');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-4 pb-4 pt-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">More</Text>
        </View>

        {/* Profile Card */}
        <View className="px-4 pt-4">
          <Card className="mb-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                <Text className="text-lg font-bold text-brand-600 dark:text-brand-300">
                  {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile?.full_name ?? 'User'}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</Text>
              </View>
              {profile?.premium_tier === 'premium' && (
                <View className="rounded-full bg-brand-50 dark:bg-brand-900 px-2.5 py-1">
                  <Text className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                    Premium
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Menu Sections */}
        <View className="px-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Features
          </Text>
          <Card padding="none" className="mb-4">
            <MenuItem icon={Target} label="Financial Roadmap" onPress={() => router.push('/(stacks)/roadmap')} />
            <MenuItem
              icon={Users}
              label="Household"
              onPress={() => router.push('/(stacks)/household-manage')}
              premium
            />
            <MenuItem
              icon={Receipt}
              label="Transaction Rules"
              onPress={() => router.push('/(stacks)/transaction-rules')}
            />
            <MenuItem
              icon={DollarSign}
              label="Paycheck Planner"
              onPress={() => router.push('/(stacks)/paycheck-planner')}
            />
            <MenuItem
              icon={Zap}
              label="Bill Reminders"
              onPress={() => router.push('/(stacks)/bill-reminders')}
            />
            <MenuItem
              icon={Repeat}
              label="Subscriptions"
              onPress={() => router.push('/(stacks)/subscription-manager')}
              premium
            />
          </Card>

          <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Settings
          </Text>
          <Card padding="none" className="mb-4">
            <MenuItem icon={User} label="Profile" onPress={() => router.push('/(stacks)/settings/profile')} />
            <MenuItem icon={Palette} label="Appearance" onPress={() => router.push('/(stacks)/settings/appearance')} />
            <MenuItem icon={Bell} label="Notifications" onPress={() => router.push('/(stacks)/settings/notifications')} />
            <MenuItem icon={Shield} label="Security" onPress={() => router.push('/(stacks)/settings/security')} />
            <MenuItem icon={CreditCard} label="Subscription" onPress={() => router.push('/(stacks)/settings/subscription')} />
            <MenuItem
              icon={Link2}
              label="Linked Accounts"
              onPress={() => router.push('/(stacks)/linked-accounts')}
              premium
            />
            <MenuItem icon={Download} label="Export Data" onPress={() => router.push('/(stacks)/settings/export-data')} />
          </Card>

          <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Support
          </Text>
          <Card padding="none" className="mb-4">
            <MenuItem icon={HelpCircle} label="Help & Support" onPress={() => {}} />
            <MenuItem icon={Info} label="About" onPress={() => router.push('/(stacks)/settings/about')} />
          </Card>

          {/* Sign Out */}
          <Card padding="none" className="mb-8">
            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center px-4 py-3.5 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <LogOut color="#EF4444" size={20} />
              <Text className="ml-3 flex-1 text-base font-medium text-danger-500">
                Sign Out
              </Text>
            </Pressable>
          </Card>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
  premium,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  premium?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-gray-50 dark:border-gray-700 px-4 py-3.5 active:bg-gray-50 dark:active:bg-gray-700"
    >
      <Icon color="#9CA3AF" size={20} />
      <Text className="ml-3 flex-1 text-base text-gray-900 dark:text-white">{label}</Text>
      {premium && (
        <View className="mr-2 rounded-full bg-brand-50 dark:bg-brand-900 px-2 py-0.5">
          <Crown color="#4F46E5" size={12} />
        </View>
      )}
      <ChevronRight color="#6B7280" size={18} />
    </Pressable>
  );
}
