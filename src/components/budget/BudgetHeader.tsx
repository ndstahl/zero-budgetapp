import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useUIStore } from '../../stores/uiStore';
import { getMonthName } from '../../utils/formatters';
import { formatCurrency } from '../../utils/formatters';
import type { BudgetSummary } from '../../types/budget';

interface BudgetHeaderProps {
  summary: BudgetSummary | null;
}

export function BudgetHeader({ summary }: BudgetHeaderProps) {
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } =
    useUIStore();

  const leftToBudget = summary?.left_to_budget ?? 0;
  const leftToBudgetColor =
    leftToBudget === 0
      ? 'text-success-500'
      : leftToBudget > 0
        ? 'text-brand-500'
        : 'text-danger-500';

  return (
    <View className="bg-white dark:bg-gray-800 px-4 pb-4 pt-2">
      {/* Month Selector */}
      <View className="mb-4 flex-row items-center justify-center">
        <Pressable
          onPress={goToPreviousMonth}
          className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-700"
        >
          <ChevronLeft color="#9CA3AF" size={24} />
        </Pressable>
        <Text className="mx-6 text-lg font-bold text-gray-900 dark:text-white">
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
        <Pressable
          onPress={goToNextMonth}
          className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-700"
        >
          <ChevronRight color="#9CA3AF" size={24} />
        </Pressable>
      </View>

      {/* Zero-Based Indicator */}
      {summary && (
        <View className="rounded-xl bg-gray-50 dark:bg-gray-700 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Left to Budget</Text>
              <Text className={`text-2xl font-bold ${leftToBudgetColor}`}>
                {formatCurrency(leftToBudget)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(summary.total_income)} income
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(summary.total_planned)} planned
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
