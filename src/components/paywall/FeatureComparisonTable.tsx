import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { Check, X } from 'lucide-react-native';

interface Feature {
  name: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: Feature[] = [
  { name: 'Zero-based budgeting', free: true, premium: true },
  { name: 'Manual transactions', free: true, premium: true },
  { name: 'Savings funds', free: true, premium: true },
  { name: 'Bill reminders', free: true, premium: true },
  { name: 'Up to 3 category groups', free: true, premium: true },
  { name: 'Unlimited categories', free: false, premium: true },
  { name: 'Bank sync (Plaid)', free: false, premium: true },
  { name: 'Auto-categorization rules', free: false, premium: true },
  { name: 'Subscription detection', free: false, premium: true },
  { name: 'Reports & charts', free: false, premium: true },
  { name: 'Net worth tracking', free: false, premium: true },
  { name: 'Household sharing', free: false, premium: true },
  { name: 'Data export', free: false, premium: true },
  { name: 'Priority support', free: false, premium: true },
];

export function FeatureComparisonTable() {
  return (
    <Card padding="none">
      {/* Header */}
      <View className="flex-row border-b border-gray-100 px-4 py-3">
        <Text className="flex-1 text-sm font-semibold text-gray-700">Feature</Text>
        <Text className="w-16 text-center text-xs font-semibold text-gray-400">Free</Text>
        <Text className="w-16 text-center text-xs font-semibold text-brand-600">
          Premium
        </Text>
      </View>

      {/* Rows */}
      {FEATURES.map((feature, idx) => (
        <View
          key={feature.name}
          className={`flex-row items-center px-4 py-2.5 ${
            idx < FEATURES.length - 1 ? 'border-b border-gray-50' : ''
          }`}
        >
          <Text className="flex-1 text-sm text-gray-700">{feature.name}</Text>
          <View className="w-16 items-center">
            {feature.free ? (
              <Check color="#22C55E" size={16} />
            ) : (
              <X color="#D1D5DB" size={16} />
            )}
          </View>
          <View className="w-16 items-center">
            <Check color="#4F46E5" size={16} />
          </View>
        </View>
      ))}
    </Card>
  );
}
