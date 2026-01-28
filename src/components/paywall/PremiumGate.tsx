import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../ui/Card';
import { Lock, Crown } from 'lucide-react-native';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

/**
 * Wraps premium-only content. If the user is not premium,
 * shows a lock overlay prompting them to upgrade.
 */
export function PremiumGate({ children, feature }: PremiumGateProps) {
  const isPremium = useAuthStore((s) => s.isPremium());

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Pressable onPress={() => router.push('/(stacks)/paywall')}>
      <Card className="items-center py-6">
        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <Crown color="#4F46E5" size={28} />
        </View>
        <Text className="mb-1 text-base font-bold text-gray-900">
          Premium Feature
        </Text>
        {feature && (
          <Text className="mb-2 text-sm text-gray-500 text-center px-4">
            {feature} is available with ZeroBudget Premium.
          </Text>
        )}
        <View className="flex-row items-center mt-1 rounded-full bg-brand-500 px-4 py-2">
          <Lock color="#FFFFFF" size={14} />
          <Text className="ml-1.5 text-sm font-semibold text-white">
            Upgrade Now
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
