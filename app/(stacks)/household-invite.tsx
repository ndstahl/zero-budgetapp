import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { useHousehold } from '../../src/hooks/useHousehold';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import Toast from 'react-native-toast-message';
import { Users, Check, X } from 'lucide-react-native';

export default function HouseholdInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { acceptInvite } = useHousehold();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!token) {
      Toast.show({ type: 'error', text1: 'Invalid invite link' });
      return;
    }

    setLoading(true);
    try {
      acceptInvite(token, {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Welcome!',
            text2: 'You have joined the household',
          });
          router.replace('/(tabs)');
        },
        onError: (err: any) => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: err.message ?? 'Failed to accept invite',
          });
        },
        onSettled: () => setLoading(false),
      });
    } catch {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand-50">
        <Users color="#4F46E5" size={36} />
      </View>

      <Text className="mb-2 text-center text-xl font-bold text-gray-900">
        Household Invitation
      </Text>
      <Text className="mb-6 text-center text-base text-gray-500">
        You've been invited to join a household. By joining, you'll share
        budgets, transactions, and savings goals with household members.
      </Text>

      <Card className="mb-6 w-full">
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Check color="#10B981" size={16} />
            <Text className="ml-2 text-sm text-gray-700">
              Shared budget planning
            </Text>
          </View>
          <View className="flex-row items-center">
            <Check color="#10B981" size={16} />
            <Text className="ml-2 text-sm text-gray-700">
              Combined transaction tracking
            </Text>
          </View>
          <View className="flex-row items-center">
            <Check color="#10B981" size={16} />
            <Text className="ml-2 text-sm text-gray-700">
              Real-time collaboration
            </Text>
          </View>
        </View>
      </Card>

      <View className="w-full space-y-3">
        <Button
          title="Accept Invitation"
          onPress={handleAccept}
          loading={loading}
          icon={<Check color="#FFFFFF" size={16} />}
          size="lg"
          fullWidth
        />
        <Button
          title="Decline"
          onPress={() => router.back()}
          variant="outline"
          icon={<X color="#374151" size={16} />}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}
