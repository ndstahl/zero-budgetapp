import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatters';
import type { NetWorthSummary } from '../../types/networth';

interface NetWorthChartProps {
  summary: NetWorthSummary;
}

export function NetWorthChart({ summary }: NetWorthChartProps) {
  const { history } = summary;

  if (history.length === 0) {
    return (
      <Card>
        <Text className="text-center text-sm text-gray-400">
          Add accounts and update balances to see your net worth trend
        </Text>
      </Card>
    );
  }

  const maxVal = Math.max(
    ...history.map((h) => Math.max(Math.abs(h.net_worth), h.assets, h.liabilities)),
    1
  );
  const minVal = Math.min(...history.map((h) => h.net_worth), 0);
  const range = maxVal - minVal || 1;

  // Show last 12 data points max
  const displayData = history.slice(-12);

  return (
    <Card>
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Net Worth Trend
      </Text>

      {/* Summary row */}
      <View className="mb-4 flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-400">Net Worth</Text>
          <Text
            className={`text-xl font-bold ${summary.net_worth >= 0 ? 'text-success-500' : 'text-danger-500'}`}
          >
            {formatCurrency(summary.net_worth)}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-gray-400">Assets</Text>
          <Text className="text-base font-semibold text-success-500">
            {formatCurrencyCompact(summary.total_assets)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Liabilities</Text>
          <Text className="text-base font-semibold text-danger-500">
            {formatCurrencyCompact(summary.total_liabilities)}
          </Text>
        </View>
      </View>

      {/* Line chart visualization (simplified area bars) */}
      <View className="flex-row items-end justify-between" style={{ height: 120 }}>
        {displayData.map((point, idx) => {
          const height = range > 0
            ? ((point.net_worth - minVal) / range) * 100
            : 50;
          const isPositive = point.net_worth >= 0;
          const dateLabel = point.date.slice(5); // "MM-DD"

          return (
            <View key={point.date} className="flex-1 items-center mx-px">
              <View
                className={`w-full rounded-t-sm ${isPositive ? 'bg-success-300' : 'bg-danger-300'}`}
                style={{ height: Math.max(height, 4) }}
              />
              {idx % Math.ceil(displayData.length / 4) === 0 && (
                <Text className="mt-1 text-xs text-gray-400" numberOfLines={1}>
                  {dateLabel}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Change indicator */}
      {displayData.length >= 2 && (() => {
        const first = displayData[0].net_worth;
        const last = displayData[displayData.length - 1].net_worth;
        const change = last - first;
        const pctChange = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;

        return (
          <View className="mt-3 flex-row items-center border-t border-gray-100 pt-3">
            <Text className="text-xs text-gray-400">Period Change: </Text>
            <Text
              className={`text-sm font-semibold ${change >= 0 ? 'text-success-500' : 'text-danger-500'}`}
            >
              {change >= 0 ? '+' : ''}{formatCurrency(change)}
              {first !== 0 ? ` (${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%)` : ''}
            </Text>
          </View>
        );
      })()}
    </Card>
  );
}
