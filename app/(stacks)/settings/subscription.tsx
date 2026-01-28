import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/stores/authStore';
import { RevenueCat } from '../../../src/lib/revenuecat';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { Crown, CheckCircle2, ExternalLink } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import type { CustomerInfo } from 'react-native-purchases';

export default function SubscriptionSettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const isPremium = useAuthStore((s) => s.isPremium);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await RevenueCat.getCustomerInfo();
      setCustomerInfo(info);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const info = await RevenueCat.restorePurchases();
      setCustomerInfo(info);
      if (RevenueCat.isPremium(info)) {
        Toast.show({ type: 'success', text1: 'Premium restored!' });
      } else {
        Toast.show({
          type: 'info',
          text1: 'No active subscription found',
        });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setRestoring(false);
    }
  };

  const premiumEntitlement = customerInfo?.entitlements.active['premium'];
  const expirationDate = premiumEntitlement?.expirationDate
    ? new Date(premiumEntitlement.expirationDate)
    : null;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Current Plan */}
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <Crown color={isPremium() ? '#4F46E5' : '#9CA3AF'} size={24} />
          <Text className="ml-2 text-lg font-bold text-gray-900">
            Current Plan
          </Text>
        </View>

        {loading ? (
          <Text className="text-sm text-gray-400">Loading...</Text>
        ) : isPremium() ? (
          <>
            <View className="flex-row items-center mb-2">
              <Badge label="Premium" variant="brand" />
              <Text className="ml-2 text-sm text-gray-500">Active</Text>
            </View>
            {expirationDate && (
              <Text className="text-sm text-gray-500">
                {premiumEntitlement?.willRenew
                  ? `Renews on ${expirationDate.toLocaleDateString()}`
                  : `Expires on ${expirationDate.toLocaleDateString()}`}
              </Text>
            )}
            {premiumEntitlement?.productIdentifier && (
              <Text className="mt-1 text-xs text-gray-400">
                Plan: {premiumEntitlement.productIdentifier}
              </Text>
            )}
          </>
        ) : (
          <>
            <View className="flex-row items-center mb-2">
              <Badge label="Free" variant="default" />
            </View>
            <Text className="mb-3 text-sm text-gray-500">
              Upgrade to Premium to unlock bank sync, reports, household
              sharing, and more.
            </Text>
            <Button
              title="Upgrade to Premium"
              onPress={() => router.push('/(stacks)/paywall')}
              fullWidth
            />
          </>
        )}
      </Card>

      {/* Premium Features */}
      {isPremium() && (
        <Card className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-900">
            Your Premium Features
          </Text>
          {[
            'Automatic bank sync via Plaid',
            'Advanced reports & insights',
            'Net worth tracking',
            'Household sharing',
            'Transaction rules & auto-categorization',
            'Subscription detection',
            'Unlimited category groups',
          ].map((feature) => (
            <View key={feature} className="flex-row items-center mb-2">
              <CheckCircle2 color="#22C55E" size={16} />
              <Text className="ml-2 text-sm text-gray-700">{feature}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Actions */}
      <Card>
        <Button
          title="Restore Purchases"
          onPress={handleRestore}
          variant="outline"
          loading={restoring}
          fullWidth
        />
        <Text className="mt-3 text-center text-xs text-gray-400">
          Manage or cancel your subscription through your device's app store
          settings.
        </Text>
      </Card>

      <View className="h-16" />
    </ScrollView>
  );
}
