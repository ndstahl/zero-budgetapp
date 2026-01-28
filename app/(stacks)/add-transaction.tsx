import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useBudget } from '../../src/hooks/useBudget';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import { Card } from '../../src/components/ui/Card';
import Toast from 'react-native-toast-message';
import type { TransactionType } from '../../src/types/transaction';

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState(0);
  const [merchantName, setMerchantName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { createTransaction } = useTransactions();
  const { budget } = useBudget();

  const handleSave = async () => {
    if (amount === 0) {
      Toast.show({ type: 'error', text1: 'Amount required', text2: 'Enter a transaction amount' });
      return;
    }

    setLoading(true);
    try {
      createTransaction(
        {
          amount,
          merchant_name: merchantName || undefined,
          description: description || undefined,
          date,
          type,
          line_item_id: selectedLineItemId ?? undefined,
          budget_id: budget?.id,
        },
        {
          onSuccess: () => {
            Toast.show({ type: 'success', text1: 'Transaction added' });
            router.back();
          },
          onError: (err: any) => {
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Get expense line items for category picker
  const lineItems = budget?.category_groups
    .filter((g) => !g.is_income)
    .flatMap((g) =>
      g.line_items.map((item) => ({
        ...item,
        groupName: g.name,
      }))
    ) ?? [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Selector */}
        <View className="mb-4 flex-row rounded-xl bg-gray-100 p-1">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              className={`flex-1 items-center rounded-lg py-2.5 ${
                type === t ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  type === t ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {t === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Amount */}
        <View className="mb-4">
          <CurrencyInput
            value={amount}
            onChangeValue={setAmount}
            label="Amount"
          />
        </View>

        {/* Merchant Name */}
        <View className="mb-4">
          <Input
            label="Merchant / Payee"
            placeholder="e.g. Walmart, Starbucks"
            value={merchantName}
            onChangeText={setMerchantName}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Input
            label="Description (optional)"
            placeholder="What was this for?"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Date */}
        <View className="mb-4">
          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* Category Picker */}
        {type === 'expense' && lineItems.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Category</Text>
            <Card variant="outlined" padding="none">
              {lineItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    setSelectedLineItemId(
                      selectedLineItemId === item.id ? null : item.id
                    )
                  }
                  className={`border-b border-gray-50 px-4 py-3 ${
                    selectedLineItemId === item.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selectedLineItemId === item.id
                        ? 'font-semibold text-brand-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-400">{item.groupName}</Text>
                </Pressable>
              ))}
            </Card>
          </View>
        )}

        {/* Save Button */}
        <View className="mt-4">
          <Button
            title="Save Transaction"
            onPress={handleSave}
            loading={loading}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
