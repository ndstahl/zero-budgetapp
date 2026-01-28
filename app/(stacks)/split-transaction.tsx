import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { useBudget } from '../../src/hooks/useBudget';
import { transactionService } from '../../src/services/transaction.service';
import { Button } from '../../src/components/ui/Button';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import { Card } from '../../src/components/ui/Card';
import { formatCurrency } from '../../src/utils/formatters';
import Toast from 'react-native-toast-message';
import { Plus, Trash2, Split } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { SplitItem } from '../../src/types/transaction';

interface SplitRow {
  id: string;
  line_item_id: string;
  line_item_name: string;
  group_name: string;
  amount: number;
}

export default function SplitTransactionScreen() {
  const { transactionId, totalAmount: totalStr } = useLocalSearchParams<{
    transactionId: string;
    totalAmount: string;
  }>();

  const totalAmount = parseInt(totalStr ?? '0', 10);
  const { budget } = useBudget();
  const queryClient = useQueryClient();
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [loading, setLoading] = useState(false);

  const allocatedAmount = splits.reduce((sum, s) => sum + s.amount, 0);
  const remainingAmount = totalAmount - allocatedAmount;

  const lineItems = budget?.category_groups
    .filter((g) => !g.is_income)
    .flatMap((g) =>
      g.line_items.map((item) => ({
        id: item.id,
        name: item.name,
        groupName: g.name,
      }))
    ) ?? [];

  const addSplit = (lineItemId: string, lineItemName: string, groupName: string) => {
    if (splits.some((s) => s.line_item_id === lineItemId)) return;
    setSplits([
      ...splits,
      {
        id: Math.random().toString(36).substr(2, 9),
        line_item_id: lineItemId,
        line_item_name: lineItemName,
        group_name: groupName,
        amount: 0,
      },
    ]);
  };

  const updateSplitAmount = (id: string, amount: number) => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, amount } : s)));
  };

  const removeSplit = (id: string) => {
    setSplits(splits.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (splits.length < 2) {
      Toast.show({ type: 'error', text1: 'Add at least 2 categories to split' });
      return;
    }
    if (remainingAmount !== 0) {
      Toast.show({ type: 'error', text1: 'Split amounts must equal total' });
      return;
    }

    setLoading(true);
    try {
      const splitItems: SplitItem[] = splits.map((s) => ({
        line_item_id: s.line_item_id,
        amount: s.amount,
      }));
      await transactionService.splitTransaction(transactionId!, splitItems);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      Toast.show({ type: 'success', text1: 'Transaction split!' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Total */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Split color="#4F46E5" size={20} />
              <Text className="ml-2 text-base font-semibold text-gray-900">
                Split Transaction
              </Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </Card>

        {/* Split Rows */}
        {splits.map((split) => (
          <Card key={split.id} className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">
                  {split.line_item_name}
                </Text>
                <Text className="text-xs text-gray-400">{split.group_name}</Text>
              </View>
              <Pressable onPress={() => removeSplit(split.id)} className="p-1">
                <Trash2 color="#EF4444" size={16} />
              </Pressable>
            </View>
            <CurrencyInput
              value={split.amount}
              onChangeValue={(amt) => updateSplitAmount(split.id, amt)}
            />
          </Card>
        ))}

        {/* Remaining */}
        <View className="mb-4 rounded-xl bg-gray-100 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Remaining to allocate</Text>
            <Text
              className={`text-base font-bold ${
                remainingAmount === 0
                  ? 'text-success-500'
                  : remainingAmount < 0
                    ? 'text-danger-500'
                    : 'text-brand-500'
              }`}
            >
              {formatCurrency(remainingAmount)}
            </Text>
          </View>
        </View>

        {/* Add Category */}
        <Text className="mb-2 text-sm font-semibold text-gray-700">Add Category</Text>
        <Card variant="outlined" padding="none" className="mb-4">
          {lineItems
            .filter((li) => !splits.some((s) => s.line_item_id === li.id))
            .map((item) => (
              <Pressable
                key={item.id}
                onPress={() => addSplit(item.id, item.name, item.groupName)}
                className="flex-row items-center border-b border-gray-50 px-4 py-3 active:bg-gray-50"
              >
                <Plus color="#4F46E5" size={16} />
                <View className="ml-2">
                  <Text className="text-sm text-gray-700">{item.name}</Text>
                  <Text className="text-xs text-gray-400">{item.groupName}</Text>
                </View>
              </Pressable>
            ))}
        </Card>

        {/* Save */}
        <Button
          title="Save Split"
          onPress={handleSave}
          loading={loading}
          disabled={remainingAmount !== 0 || splits.length < 2}
          size="lg"
          fullWidth
        />

        <View className="h-16" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
