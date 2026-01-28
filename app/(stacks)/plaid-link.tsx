import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { PlaidLinkButton } from '../../src/components/plaid/PlaidLinkButton';
import { Card } from '../../src/components/ui/Card';
import {
  Shield,
  RefreshCw,
  Zap,
  Lock,
} from 'lucide-react-native';

export default function PlaidLinkScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Hero */}
      <View className="items-center py-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <Lock color="#4F46E5" size={36} />
        </View>
        <Text className="text-center text-xl font-bold text-gray-900">
          Connect Your Bank
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500 px-4">
          Securely link your bank accounts to automatically import transactions
          and keep your budget up to date.
        </Text>
      </View>

      {/* Features */}
      <View className="mb-6">
        <FeatureRow
          icon={<RefreshCw color="#4F46E5" size={20} />}
          title="Automatic Sync"
          description="Transactions import automatically, no manual entry needed"
        />
        <FeatureRow
          icon={<Zap color="#4F46E5" size={20} />}
          title="Auto-Categorize"
          description="Transaction rules automatically assign categories"
        />
        <FeatureRow
          icon={<Shield color="#4F46E5" size={20} />}
          title="Bank-Level Security"
          description="256-bit encryption via Plaid. We never store your login credentials."
        />
      </View>

      {/* Link Button */}
      <PlaidLinkButton
        onSuccess={() => {
          router.back();
        }}
      />

      {/* Security Note */}
      <Card className="mt-6">
        <View className="flex-row items-start">
          <Shield color="#9CA3AF" size={16} />
          <View className="ml-2 flex-1">
            <Text className="text-xs font-semibold text-gray-500">
              Powered by Plaid
            </Text>
            <Text className="mt-0.5 text-xs text-gray-400">
              Plaid connects to over 12,000 financial institutions. Your bank
              credentials are encrypted and stored by Plaid — we never have
              access to your login information.
            </Text>
          </View>
        </View>
      </Card>

      <View className="h-16" />
    </ScrollView>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View className="mb-4 flex-row items-start">
      <View className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-brand-50">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500">{description}</Text>
      </View>
    </View>
  );
}
