import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSubscriptions } from '../../src/hooks/useSubscriptions';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { formatCurrency } from '../../src/utils/formatters';
import Toast from 'react-native-toast-message';
import {
  CreditCard,
  Check,
  X,
  RefreshCw,
  Calendar,
  Repeat,
} from 'lucide-react-native';
import type { DetectedSubscription } from '../../src/types/plaid';

export default function SubscriptionManagerScreen() {
  const {
    confirmed,
    unconfirmed,
    totalMonthly,
    isLoading,
    isDetecting,
    confirmSubscription,
    dismissSubscription,
    detectSubscriptions,
  } = useSubscriptions();

  const handleDetect = async () => {
    try {
      const result = await detectSubscriptions();
      Toast.show({
        type: 'success',
        text1: 'Detection Complete',
        text2: `Found ${result.detected} recurring charges`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Detection Failed',
        text2: err.message,
      });
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-900">Subscriptions</Text>
        <Text className="text-sm text-gray-500">
          Track recurring charges from your linked accounts
        </Text>
      </View>

      {/* Monthly Total */}
      {confirmed.length > 0 && (
        <Card className="mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Estimated Monthly Total
          </Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(totalMonthly)}
          </Text>
          <Text className="text-sm text-gray-500">
            across {confirmed.length} subscription{confirmed.length !== 1 ? 's' : ''}
          </Text>
        </Card>
      )}

      {/* Scan Button */}
      <Button
        title={isDetecting ? 'Scanning...' : 'Scan for Subscriptions'}
        onPress={handleDetect}
        loading={isDetecting}
        variant="outline"
        icon={<RefreshCw color="#4F46E5" size={16} />}
        fullWidth
        size="md"
      />

      {/* Unconfirmed Section */}
      {unconfirmed.length > 0 && (
        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Detected ({unconfirmed.length})
          </Text>
          {unconfirmed.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onConfirm={() => confirmSubscription(sub.id)}
              onDismiss={() => dismissSubscription(sub.id)}
            />
          ))}
        </View>
      )}

      {/* Confirmed Section */}
      {confirmed.length > 0 && (
        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Confirmed ({confirmed.length})
          </Text>
          {confirmed.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              confirmed
              onDismiss={() => dismissSubscription(sub.id)}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {confirmed.length === 0 && unconfirmed.length === 0 && (
        <View className="mt-4">
          <EmptyState
            title="No Subscriptions Found"
            description="Link your bank account and scan to auto-detect recurring charges like Netflix, Spotify, and more."
            icon={<CreditCard color="#4F46E5" size={48} />}
            actionTitle="Scan Now"
            onAction={handleDetect}
          />
        </View>
      )}

      <View className="h-16" />
    </ScrollView>
  );
}

function SubscriptionCard({
  subscription,
  confirmed,
  onConfirm,
  onDismiss,
}: {
  subscription: DetectedSubscription;
  confirmed?: boolean;
  onConfirm?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand-50">
          <CreditCard color="#4F46E5" size={18} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-gray-900">
              {subscription.merchant_name}
            </Text>
            {confirmed && (
              <Badge label="Confirmed" variant="success" />
            )}
          </View>
          <View className="flex-row items-center mt-0.5">
            {subscription.frequency && (
              <View className="flex-row items-center mr-3">
                <Repeat color="#9CA3AF" size={11} />
                <Text className="ml-0.5 text-xs capitalize text-gray-400">
                  {subscription.frequency}
                </Text>
              </View>
            )}
            {subscription.next_expected && (
              <View className="flex-row items-center">
                <Calendar color="#9CA3AF" size={11} />
                <Text className="ml-0.5 text-xs text-gray-400">
                  Next: {subscription.next_expected}
                </Text>
              </View>
            )}
          </View>
        </View>
        {subscription.estimated_amount !== null && (
          <Text className="text-base font-bold text-gray-900">
            {formatCurrency(subscription.estimated_amount)}
          </Text>
        )}
      </View>

      {/* Actions for unconfirmed */}
      {!confirmed && (
        <View className="mt-3 flex-row border-t border-gray-100 pt-2">
          {onConfirm && (
            <Pressable
              onPress={onConfirm}
              className="mr-4 flex-row items-center py-1"
            >
              <Check color="#10B981" size={14} />
              <Text className="ml-1 text-sm font-medium text-success-500">
                Confirm
              </Text>
            </Pressable>
          )}
          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              className="flex-row items-center py-1"
            >
              <X color="#9CA3AF" size={14} />
              <Text className="ml-1 text-sm font-medium text-gray-400">
                Dismiss
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  );
}
