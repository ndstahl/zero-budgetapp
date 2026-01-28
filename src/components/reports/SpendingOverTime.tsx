import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatters';
import type { MonthlyTrend } from '../../types/reports';

interface SpendingOverTimeProps {
  data: MonthlyTrend[];
}

export function SpendingOverTime({ data }: SpendingOverTimeProps) {
  if (data.length === 0) {
    return (
      <Card>
        <Text className="text-center text-sm text-gray-400">
          No trend data available
        </Text>
      </Card>
    );
  }

  const maxSpent = Math.max(...data.map((d) => d.totalSpent), 1);

  return (
    <Card>
      <Text className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Spending Over Time
      </Text>

      {/* Bar chart */}
      <View className="flex-row items-end justify-between" style={{ height: 160 }}>
        {data.map((month) => {
          const barHeight = maxSpent > 0 ? (month.totalSpent / maxSpent) * 140 : 0;
          const isCurrentMonth =
            month.month === new Date().getMonth() + 1 &&
            month.year === new Date().getFullYear();

          return (
            <View key={`${month.year}-${month.month}`} className="flex-1 items-center mx-0.5">
              {/* Amount label */}
              <Text className="mb-1 text-xs text-gray-400" numberOfLines={1}>
                {month.totalSpent > 0 ? formatCurrencyCompact(month.totalSpent) : ''}
              </Text>
              {/* Bar */}
              <View
                className={`w-full rounded-t-md ${isCurrentMonth ? 'bg-brand-500' : 'bg-brand-200'}`}
                style={{ height: Math.max(barHeight, 4) }}
              />
              {/* Month label */}
              <Text
                className={`mt-1 text-xs ${isCurrentMonth ? 'font-bold text-brand-600' : 'text-gray-400'}`}
              >
                {month.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      <View className="mt-4 flex-row justify-between border-t border-gray-100 pt-3">
        <View>
          <Text className="text-xs text-gray-400">Average</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {formatCurrency(
              data.reduce((s, d) => s + d.totalSpent, 0) / Math.max(data.filter((d) => d.totalSpent > 0).length, 1)
            )}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Highest</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {formatCurrency(maxSpent)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
