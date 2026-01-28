import { View, Text, Pressable } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import type { FundWithContributions } from '../../services/fund.service';
import { PiggyBank } from 'lucide-react-native';

interface FundCardProps {
  fund: FundWithContributions;
  onPress: () => void;
}

export function FundCard({ fund, onPress }: FundCardProps) {
  const progressColor =
    fund.progress_percent >= 1
      ? 'success'
      : fund.progress_percent >= 0.5
        ? 'brand'
        : 'warning';

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5 active:opacity-95"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: fund.color + '20' }}
          >
            <PiggyBank color={fund.color} size={20} />
          </View>
          <View>
            <Text className="text-base font-semibold text-gray-900">{fund.name}</Text>
            <Text className="text-xs text-gray-400">
              {formatPercent(fund.progress_percent)} complete
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-gray-900">
            {formatCurrency(fund.current_balance)}
          </Text>
          <Text className="text-xs text-gray-400">
            of {formatCurrency(fund.target_amount)}
          </Text>
        </View>
      </View>

      <ProgressBar progress={fund.progress_percent} color={progressColor} height="md" />

      {fund.progress_percent >= 1 && (
        <View className="mt-2 rounded-lg bg-success-50 px-3 py-1.5">
          <Text className="text-center text-xs font-semibold text-success-700">
            Goal reached!
          </Text>
        </View>
      )}
    </Pressable>
  );
}
