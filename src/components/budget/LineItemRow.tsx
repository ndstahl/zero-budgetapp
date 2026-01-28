import { View, Text, Pressable } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import { getBudgetStatusColor, getSpendingProgress } from '../../utils/budgetCalculations';
import type { LineItemWithSpent } from '../../types/budget';

interface LineItemRowProps {
  item: LineItemWithSpent;
  onPress: () => void;
  onUpdatePlanned: (amount: number) => void;
}

export function LineItemRow({ item, onPress }: LineItemRowProps) {
  const statusColor = getBudgetStatusColor(item.planned_amount, item.spent_amount);
  const progress = getSpendingProgress(item.planned_amount, item.spent_amount);

  const progressColor =
    statusColor === 'danger'
      ? 'danger'
      : statusColor === 'warning'
        ? 'warning'
        : 'success';

  return (
    <Pressable
      onPress={onPress}
      className="border-b border-gray-50 bg-white px-4 py-3 active:bg-gray-50"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View className="flex-row">
          <Text className="w-24 text-right text-sm text-gray-700">
            {formatCurrency(item.planned_amount)}
          </Text>
          <Text className="w-24 text-right text-sm text-gray-700">
            {formatCurrency(item.spent_amount)}
          </Text>
          <Text
            className={`w-24 text-right text-sm font-medium ${
              item.remaining_amount < 0 ? 'text-danger-500' : 'text-gray-700'
            }`}
          >
            {formatCurrency(item.remaining_amount)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {item.planned_amount > 0 && (
        <View className="mt-2">
          <ProgressBar progress={progress} color={progressColor} height="sm" />
        </View>
      )}
    </Pressable>
  );
}
