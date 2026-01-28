import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBudget } from '../../src/hooks/useBudget';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useFunds } from '../../src/hooks/useFunds';
import { useBillReminders } from '../../src/hooks/useBillReminders';
import { useAuthStore } from '../../src/stores/authStore';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { TransactionCard } from '../../src/components/transactions/TransactionCard';
import { FundCard } from '../../src/components/funds/FundCard';
import { formatCurrency, formatPercent, getMonthName } from '../../src/utils/formatters';
import { useUIStore } from '../../src/stores/uiStore';
import {
  Plus,
  Wallet,
  ArrowRight,
  TrendingDown,
  Bell,
  Calendar,
  CreditCard,
  PiggyBank,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { selectedMonth, selectedYear } = useUIStore();
  const { budget } = useBudget();
  const { transactions } = useTransactions({ limit: 5 });
  const { funds } = useFunds();
  const { upcomingBills } = useBillReminders();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const summary = budget?.summary;
  const activeFunds = funds.filter((f) => f.progress_percent < 1).slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-4 pb-4 pt-4">
          <Text className="text-lg text-gray-500">Hello, {firstName}</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        <View className="px-4 pt-4">
          {/* Budget Overview Card */}
          {summary ? (
            <Card className="mb-4">
              <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Budget Overview
              </Text>
              <View className="mb-3 flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-400">Spent</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    {formatCurrency(summary.total_spent)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400">
                    of {formatCurrency(summary.total_planned)}
                  </Text>
                  <Text className="text-sm font-medium text-gray-500">
                    {formatPercent(summary.percent_spent)} used
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={summary.percent_spent}
                color={
                  summary.percent_spent > 1
                    ? 'danger'
                    : summary.percent_spent > 0.8
                      ? 'warning'
                      : 'brand'
                }
                height="md"
              />
              <View className="mt-3 flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-400">Left to Spend</Text>
                  <Text
                    className={`text-lg font-bold ${
                      summary.left_to_spend >= 0 ? 'text-success-500' : 'text-danger-500'
                    }`}
                  >
                    {formatCurrency(summary.left_to_spend)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400">Left to Budget</Text>
                  <Text
                    className={`text-lg font-bold ${
                      summary.left_to_budget === 0
                        ? 'text-success-500'
                        : 'text-brand-500'
                    }`}
                  >
                    {formatCurrency(summary.left_to_budget)}
                  </Text>
                </View>
              </View>
            </Card>
          ) : (
            <Card className="mb-4" onPress={() => router.push('/(tabs)/budget')}>
              <View className="items-center py-4">
                <Wallet color="#4F46E5" size={32} />
                <Text className="mt-2 text-base font-semibold text-gray-900">
                  Create Your Budget
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Tap here to set up your budget for this month
                </Text>
              </View>
            </Card>
          )}

          {/* Quick Actions */}
          <View className="mb-4 flex-row">
            <Pressable
              onPress={() => router.push('/(stacks)/add-transaction')}
              className="mr-2 flex-1 flex-row items-center rounded-xl bg-brand-500 px-4 py-3"
            >
              <Plus color="#FFFFFF" size={18} />
              <Text className="ml-2 text-sm font-semibold text-white">
                Add Transaction
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/budget')}
              className="flex-1 flex-row items-center rounded-xl bg-gray-100 px-4 py-3"
            >
              <TrendingDown color="#374151" size={18} />
              <Text className="ml-2 text-sm font-semibold text-gray-700">
                View Budget
              </Text>
            </Pressable>
          </View>

          {/* Upcoming Bills */}
          {upcomingBills.length > 0 && (
            <View className="mb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Bell color="#F59E0B" size={16} />
                  <Text className="ml-1 text-base font-bold text-gray-900">
                    Bills Due Soon
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(stacks)/bill-reminders')}
                  className="flex-row items-center"
                >
                  <Text className="text-sm font-medium text-brand-500">
                    Manage
                  </Text>
                  <ArrowRight color="#4F46E5" size={14} />
                </Pressable>
              </View>
              <Card padding="none">
                {upcomingBills.map((bill, idx) => (
                  <View key={bill.id}>
                    <View className="flex-row items-center px-4 py-3">
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-warning-50">
                        <CreditCard color="#F59E0B" size={16} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900">
                          {bill.name}
                        </Text>
                        <View className="flex-row items-center">
                          <Calendar color="#9CA3AF" size={11} />
                          <Text className="ml-1 text-xs text-gray-400">
                            Due on the {bill.due_day}
                            {bill.due_day === 1
                              ? 'st'
                              : bill.due_day === 2
                                ? 'nd'
                                : bill.due_day === 3
                                  ? 'rd'
                                  : 'th'}
                          </Text>
                        </View>
                      </View>
                      {bill.amount && (
                        <Text className="text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.amount)}
                        </Text>
                      )}
                    </View>
                    {idx < upcomingBills.length - 1 && (
                      <View className="h-px bg-gray-100" />
                    )}
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Savings Funds */}
          {activeFunds.length > 0 && (
            <View className="mb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <PiggyBank color="#4F46E5" size={16} />
                  <Text className="ml-1 text-base font-bold text-gray-900">
                    Savings Goals
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(stacks)/add-fund')}
                  className="flex-row items-center"
                >
                  <Text className="text-sm font-medium text-brand-500">
                    Add Fund
                  </Text>
                  <ArrowRight color="#4F46E5" size={14} />
                </Pressable>
              </View>
              {activeFunds.map((fund) => (
                <FundCard
                  key={fund.id}
                  fund={fund}
                  onPress={() =>
                    router.push({
                      pathname: '/(stacks)/fund-detail',
                      params: { id: fund.id },
                    })
                  }
                />
              ))}
            </View>
          )}

          {/* Recent Transactions */}
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-900">
                Recent Transactions
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/transactions')}
                className="flex-row items-center"
              >
                <Text className="text-sm font-medium text-brand-500">
                  See All
                </Text>
                <ArrowRight color="#4F46E5" size={14} />
              </Pressable>
            </View>

            <Card padding="none">
              {transactions.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-sm text-gray-400">
                    No transactions yet
                  </Text>
                </View>
              ) : (
                transactions.map((tx, idx) => (
                  <View key={tx.id}>
                    <TransactionCard
                      transaction={tx}
                      onPress={() =>
                        router.push({
                          pathname: '/(stacks)/edit-transaction',
                          params: { id: tx.id },
                        })
                      }
                    />
                    {idx < transactions.length - 1 && (
                      <View className="h-px bg-gray-100" />
                    )}
                  </View>
                ))
              )}
            </Card>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
