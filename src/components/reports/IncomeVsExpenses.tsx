import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatters';
import type { IncomeVsExpense } from '../../types/reports';

interface IncomeVsExpensesProps {
  data: IncomeVsExpense[];
}

export function IncomeVsExpenses({ data }: IncomeVsExpensesProps) {
  if (data.length === 0) {
    return (
      <Card>
        <Text className="text-center text-sm text-gray-400">
          No data available
        </Text>
      </Card>
    );
  }

  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);

  return (
    <Card>
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Income vs. Expenses
      </Text>

      {/* Legend */}
      <View className="mb-4 flex-row">
        <View className="mr-4 flex-row items-center">
          <View className="mr-1.5 h-3 w-3 rounded-sm bg-success-400" />
          <Text className="text-xs text-gray-500">Income</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-1.5 h-3 w-3 rounded-sm bg-danger-400" />
          <Text className="text-xs text-gray-500">Expenses</Text>
        </View>
      </View>

      {/* Grouped bar chart */}
      <View className="flex-row items-end justify-between" style={{ height: 160 }}>
        {data.map((month) => {
          const incomeHeight = maxValue > 0 ? (month.income / maxValue) * 140 : 0;
          const expenseHeight = maxValue > 0 ? (month.expenses / maxValue) * 140 : 0;

          return (
            <View
              key={`${month.year}-${month.month}`}
              className="flex-1 items-center mx-0.5"
            >
              <View className="flex-row items-end w-full justify-center">
                {/* Income bar */}
                <View
                  className="w-2/5 rounded-t-sm bg-success-400 mr-0.5"
                  style={{ height: Math.max(incomeHeight, 2) }}
                />
                {/* Expense bar */}
                <View
                  className="w-2/5 rounded-t-sm bg-danger-400"
                  style={{ height: Math.max(expenseHeight, 2) }}
                />
              </View>
              <Text className="mt-1 text-xs text-gray-400">{month.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Monthly net summary */}
      <View className="mt-4 border-t border-gray-100 pt-3">
        {data.length > 0 && (() => {
          const latest = data[data.length - 1];
          const net = latest.income - latest.expenses;
          return (
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-gray-400">This Month Net</Text>
                <Text
                  className={`text-sm font-semibold ${net >= 0 ? 'text-success-500' : 'text-danger-500'}`}
                >
                  {net >= 0 ? '+' : ''}{formatCurrency(net)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-400">Income</Text>
                <Text className="text-sm font-semibold text-success-500">
                  {formatCurrencyCompact(latest.income)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-400">Expenses</Text>
                <Text className="text-sm font-semibold text-danger-500">
                  {formatCurrencyCompact(latest.expenses)}
                </Text>
              </View>
            </View>
          );
        })()}
      </View>
    </Card>
  );
}
