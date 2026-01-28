import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { FeatureComparisonTable } from '../../src/components/paywall/FeatureComparisonTable';
import { RevenueCat } from '../../src/lib/revenuecat';
import Toast from 'react-native-toast-message';
import {
  Crown,
  Check,
  Zap,
  Shield,
  BarChart3,
  Users,
  Link2,
} from 'lucide-react-native';
import type { PurchasesPackage } from 'react-native-purchases';

type PlanType = 'monthly' | 'annual';

export default function PaywallScreen() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const pkgs = await RevenueCat.getOfferings();
      setPackages(pkgs);
    } catch {
      // Packages may not load in dev/sandbox
    } finally {
      setLoadingPackages(false);
    }
  };

  const monthlyPkg = packages.find(
    (p) => p.packageType === 'MONTHLY'
  );
  const annualPkg = packages.find(
    (p) => p.packageType === 'ANNUAL'
  );

  const handlePurchase = async () => {
    const pkg = selectedPlan === 'annual' ? annualPkg : monthlyPkg;
    if (!pkg) {
      Toast.show({
        type: 'info',
        text1: 'Not Available',
        text2: 'In-app purchases require a production build with RevenueCat configured.',
      });
      return;
    }

    setLoading(true);
    try {
      const customerInfo = await RevenueCat.purchasePackage(pkg);
      if (RevenueCat.isPremium(customerInfo)) {
        Toast.show({ type: 'success', text1: 'Welcome to Premium!' });
        router.back();
      }
    } catch (err: any) {
      if (err.userCancelled) return;
      Toast.show({
        type: 'error',
        text1: 'Purchase Error',
        text2: err.message ?? 'Purchase failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const customerInfo = await RevenueCat.restorePurchases();
      if (RevenueCat.isPremium(customerInfo)) {
        Toast.show({ type: 'success', text1: 'Purchase Restored!' });
        router.back();
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Purchases Found',
          text2: 'No active subscription was found for this account.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Restore Error',
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Hero */}
      <View className="items-center bg-brand-500 px-6 pb-8 pt-8">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <Crown color="#FFFFFF" size={32} />
        </View>
        <Text className="text-center text-2xl font-bold text-white">
          ZeroBudget Premium
        </Text>
        <Text className="mt-2 text-center text-base text-white/80">
          Unlock the full power of your finances
        </Text>
      </View>

      {/* Feature highlights */}
      <View className="px-4 -mt-4">
        <Card>
          <View className="space-y-3">
            <FeatureHighlight
              icon={<Link2 color="#4F46E5" size={18} />}
              title="Bank Sync"
              description="Auto-import transactions from your bank"
            />
            <FeatureHighlight
              icon={<BarChart3 color="#4F46E5" size={18} />}
              title="Reports & Insights"
              description="Spending trends, categories, income vs expenses"
            />
            <FeatureHighlight
              icon={<Users color="#4F46E5" size={18} />}
              title="Household Sharing"
              description="Budget together with a partner or family"
            />
            <FeatureHighlight
              icon={<Shield color="#4F46E5" size={18} />}
              title="Net Worth Tracking"
              description="Track assets, liabilities, and progress"
            />
            <FeatureHighlight
              icon={<Zap color="#4F46E5" size={18} />}
              title="Auto-Categorization"
              description="Rules engine + subscription detection"
            />
          </View>
        </Card>
      </View>

      {/* Plan Selection */}
      <View className="mt-6 px-4">
        <Text className="mb-3 text-center text-sm font-semibold text-gray-500">
          CHOOSE YOUR PLAN
        </Text>

        <View className="flex-row">
          {/* Annual */}
          <Pressable
            onPress={() => setSelectedPlan('annual')}
            className={`flex-1 mr-2 rounded-xl border-2 p-4 ${
              selectedPlan === 'annual'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200'
            }`}
          >
            <View className="mb-1 self-start rounded-full bg-success-500 px-2 py-0.5">
              <Text className="text-xs font-bold text-white">SAVE 33%</Text>
            </View>
            <Text className="mt-2 text-lg font-bold text-gray-900">Annual</Text>
            <Text className="text-2xl font-bold text-brand-600">
              {annualPkg?.product.priceString ?? '$79.99'}
            </Text>
            <Text className="text-xs text-gray-400">
              {annualPkg ? '' : '~$6.67/month'}
            </Text>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPlan('monthly')}
            className={`flex-1 rounded-xl border-2 p-4 ${
              selectedPlan === 'monthly'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200'
            }`}
          >
            <Text className="mt-4 text-lg font-bold text-gray-900">Monthly</Text>
            <Text className="text-2xl font-bold text-brand-600">
              {monthlyPkg?.product.priceString ?? '$9.99'}
            </Text>
            <Text className="text-xs text-gray-400">per month</Text>
          </Pressable>
        </View>
      </View>

      {/* CTA */}
      <View className="mt-6 px-4">
        <Button
          title={loading ? 'Processing...' : 'Start Premium'}
          onPress={handlePurchase}
          loading={loading}
          size="lg"
          fullWidth
        />

        <Pressable onPress={handleRestore} className="mt-3 items-center py-2">
          <Text className="text-sm text-brand-500">
            Restore Previous Purchase
          </Text>
        </Pressable>
      </View>

      {/* Feature Comparison */}
      <View className="mt-6 px-4">
        <Text className="mb-3 text-center text-sm font-semibold text-gray-500">
          COMPARE PLANS
        </Text>
        <FeatureComparisonTable />
      </View>

      {/* Legal */}
      <View className="mt-6 px-6">
        <Text className="text-center text-xs text-gray-300">
          Recurring billing. Cancel anytime.{'\n'}
          Payment will be charged to your App Store or Play Store account.{'\n'}
          Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand-50">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900">{title}</Text>
        <Text className="text-xs text-gray-500">{description}</Text>
      </View>
      <Check color="#22C55E" size={16} />
    </View>
  );
}
