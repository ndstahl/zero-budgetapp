import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFundDetail, useFunds } from '../../src/hooks/useFunds';
import { useBudget } from '../../src/hooks/useBudget';
import { useUIStore } from '../../src/stores/uiStore';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { FundContributionInput } from '../../src/components/funds/FundContributionInput';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { formatCurrency, formatPercent, getMonthShort } from '../../src/utils/formatters';
import { PiggyBank, Trash2 } from 'lucide-react-native';

export default function FundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fund, isLoading } = useFundDetail(id!);
  const { deleteFund, addContribution, isContributing } = useFunds();
  const { budget } = useBudget();
  const { selectedMonth, selectedYear } = useUIStore();

  if (isLoading || !fund) return <LoadingScreen />;

  const progressColor =
    fund.progress_percent >= 1
      ? 'success'
      : fund.progress_percent >= 0.5
        ? 'brand'
        : 'warning';

  const remaining = fund.target_amount - fund.current_balance;

  const handleContribute = (amount: number) => {
    if (!budget) return;
    addContribution({
      fundId: fund.id,
      budgetId: budget.id,
      amount,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Fund', `Are you sure you want to delete "${fund.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteFund(fund.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Header Card */}
      <Card className="mb-4">
        <View className="items-center pb-2">
          <View
            className="mb-3 h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: fund.color + '20' }}
          >
            <PiggyBank color={fund.color} size={32} />
          </View>
          <Text className="text-xl font-bold text-gray-900">{fund.name}</Text>
          <Text className="mt-1 text-sm text-gray-400">
            {formatPercent(fund.progress_percent)} of goal
          </Text>
        </View>

        <View className="my-4">
          <ProgressBar progress={fund.progress_percent} color={progressColor} height="lg" />
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-400">Saved</Text>
            <Text className="text-lg font-bold text-gray-900">
              {formatCurrency(fund.current_balance)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400">Remaining</Text>
            <Text className="text-lg font-bold text-gray-500">
              {formatCurrency(Math.max(remaining, 0))}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-400">Target</Text>
            <Text className="text-lg font-bold text-gray-900">
              {formatCurrency(fund.target_amount)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Contribute */}
      {fund.progress_percent < 1 && (
        <View className="mb-4">
          <FundContributionInput
            onContribute={handleContribute}
            isLoading={isContributing}
          />
        </View>
      )}

      {/* Contribution History */}
      <Card className="mb-4">
        <Text className="mb-3 text-sm font-semibold text-gray-700">
          Contribution History
        </Text>
        {fund.contributions.length === 0 ? (
          <Text className="text-sm text-gray-400">No contributions yet</Text>
        ) : (
          fund.contributions
            .sort((a, b) => {
              if (a.year !== b.year) return b.year - a.year;
              return b.month - a.month;
            })
            .map((c) => (
              <View
                key={c.id}
                className="flex-row items-center justify-between border-b border-gray-50 py-2"
              >
                <Text className="text-sm text-gray-600">
                  {getMonthShort(c.month)} {c.year}
                </Text>
                <View className="flex-row">
                  <Text className="mr-4 text-sm text-gray-400">
                    Planned: {formatCurrency(c.amount)}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    Actual: {formatCurrency(c.actual_amount)}
                  </Text>
                </View>
              </View>
            ))
        )}
      </Card>

      {/* Delete */}
      <Button
        title="Delete Fund"
        onPress={handleDelete}
        variant="danger"
        icon={<Trash2 color="#FFFFFF" size={16} />}
        fullWidth
      />

      <View className="h-16" />
    </ScrollView>
  );
}
