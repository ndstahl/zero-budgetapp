import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import Constants from 'expo-constants';
import { Card } from '../../../src/components/ui/Card';
import { ExternalLink, Shield, FileText, Mail } from 'lucide-react-native';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const PRIVACY_POLICY_URL = 'https://zerobudget.app/privacy';
const TERMS_URL = 'https://zerobudget.app/terms';
const SUPPORT_EMAIL = 'support@zerobudget.app';

export default function AboutScreen() {
  const openUrl = (url: string) => Linking.openURL(url);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* App Info */}
      <View className="mb-6 items-center">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-2xl bg-brand-500">
          <Text className="text-3xl font-bold text-white">Z</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">ZeroBudget</Text>
        <Text className="text-sm text-gray-500">Version {APP_VERSION}</Text>
      </View>

      {/* Legal */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        Legal
      </Text>
      <Card padding="none" className="mb-4">
        <LinkRow
          icon={Shield}
          label="Privacy Policy"
          onPress={() => openUrl(PRIVACY_POLICY_URL)}
        />
        <LinkRow
          icon={FileText}
          label="Terms of Service"
          onPress={() => openUrl(TERMS_URL)}
          isLast
        />
      </Card>

      {/* Support */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        Support
      </Text>
      <Card padding="none" className="mb-4">
        <LinkRow
          icon={Mail}
          label="Contact Support"
          onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}`)}
          isLast
        />
      </Card>

      <View className="mt-4 items-center">
        <Text className="text-xs text-gray-400">
          Made with care for your financial wellbeing.
        </Text>
        <Text className="mt-1 text-xs text-gray-300">
          {'\u00A9'} {new Date().getFullYear()} ZeroBudget. All rights
          reserved.
        </Text>
      </View>

      <View className="h-16" />
    </ScrollView>
  );
}

function LinkRow({
  icon: Icon,
  label,
  onPress,
  isLast,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 active:bg-gray-50 ${
        !isLast ? 'border-b border-gray-50' : ''
      }`}
    >
      <Icon color="#6B7280" size={20} />
      <Text className="ml-3 flex-1 text-base text-gray-900">{label}</Text>
      <ExternalLink color="#D1D5DB" size={16} />
    </Pressable>
  );
}
