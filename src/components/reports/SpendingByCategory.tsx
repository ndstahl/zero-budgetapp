import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import type { CategorySpending } from '../../types/reports';

interface SpendingByCategoryProps {
  data: CategorySpending[];
}

export function SpendingByCategory({ data }: SpendingByCategoryProps) {
  const totalSpent = data.reduce((sum, d) => sum + d.totalSpent, 0);

  if (data.length === 0) {
    return (
      <Card>
        <Text className="text-center text-sm text-gray-400">
          No spending data for this month
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Spending by Category
      </Text>

      {/* Donut chart visual (simplified ring segments) */}
      <View className="mb-4 items-center">
        <View className="relative h-40 w-40 items-center justify-center">
          {/* Colored segments rendered as stacked rings */}
          {data.map((item, idx) => {
            const segmentPercent = totalSpent > 0 ? item.totalSpent / totalSpent : 0;
            return (
              <View
                key={item.categoryGroupId}
                className="absolute rounded-full"
                style={{
                  width: 160 - idx * 6,
                  height: 160 - idx * 6,
                  borderWidth: 12,
                  borderColor: item.color,
                  opacity: 1 - idx * 0.08,
                } as any}
              />
            );
          })}
          {/* Center text */}
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">
              {formatCurrency(totalSpent)}
            </Text>
            <Text className="text-xs text-gray-400">Total Spent</Text>
          </View>
        </View>
      </View>

      {/* Legend / breakdown */}
      {data.map((item) => (
        <View key={item.categoryGroupId} className="mb-3">
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text className="text-sm text-gray-700" numberOfLines={1}>
                {item.categoryGroupName}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-900 mr-2">
                {formatCurrency(item.totalSpent)}
              </Text>
              <Text className="text-xs text-gray-400 w-10 text-right">
                {formatPercent(item.percent)}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={item.plannedAmount > 0 ? item.totalSpent / item.plannedAmount : 0}
            color={item.totalSpent > item.plannedAmount ? 'danger' : 'brand'}
            height="sm"
          />
        </View>
      ))}
    </Card>
  );
}
