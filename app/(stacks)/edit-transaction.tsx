import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useBudget } from '../../src/hooks/useBudget';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import { Card } from '../../src/components/ui/Card';
import { formatCurrency } from '../../src/utils/formatters';
import Toast from 'react-native-toast-message';
import { Trash2, Split } from 'lucide-react-native';
import type { TransactionType } from '../../src/types/transaction';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const { budget } = useBudget();

  const transaction = transactions.find((t) => t.id === id);

  const [amount, setAmount] = useState(0);
  const [merchantName, setMerchantName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState('');
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount));
      setMerchantName(transaction.merchant_name ?? '');
      setDescription(transaction.description ?? '');
      setType(transaction.type);
      setDate(transaction.date);
      setSelectedLineItemId(transaction.line_item_id);
      setNotes(transaction.notes ?? '');
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Transaction not found</Text>
      </View>
    );
  }

  const lineItems = budget?.category_groups
    .filter((g) => !g.is_income)
    .flatMap((g) =>
      g.line_items.map((item) => ({
        ...item,
        groupName: g.name,
      }))
    ) ?? [];

  const handleSave = () => {
    if (amount === 0) {
      Toast.show({ type: 'error', text1: 'Amount required' });
      return;
    }
    setLoading(true);
    updateTransaction(
      {
        id: transaction.id,
        updates: {
          amount,
          merchant_name: merchantName || undefined,
          description: description || undefined,
          date,
          type,
          line_item_id: selectedLineItemId ?? undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Transaction updated' });
          router.back();
        },
        onError: (err: any) => {
          Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        },
        onSettled: () => setLoading(false),
      }
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(transaction.id);
          router.back();
        },
      },
    ]);
  };

  const handleSplit = () => {
    router.push({
      pathname: '/(stacks)/split-transaction',
      params: {
        transactionId: transaction.id,
        totalAmount: Math.abs(transaction.amount).toString(),
      },
    });
  };

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
              <Text className={`text-sm font-semibold ${type === t ? 'text-gray-900' : 'text-gray-500'}`}>
                {t === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mb-4">
          <CurrencyInput value={amount} onChangeValue={setAmount} label="Amount" />
        </View>

        <View className="mb-4">
          <Input
            label="Merchant / Payee"
            placeholder="e.g. Walmart, Starbucks"
            value={merchantName}
            onChangeText={setMerchantName}
          />
        </View>

        <View className="mb-4">
          <Input
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mb-4">
          <Input label="Date" value={date} onChangeText={setDate} />
        </View>

        <View className="mb-4">
          <Input
            label="Notes (optional)"
            placeholder="Any additional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Category Picker */}
        {type === 'expense' && lineItems.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Category</Text>
            <Card variant="outlined" padding="none">
              <Pressable
                onPress={() => setSelectedLineItemId(null)}
                className={`border-b border-gray-50 px-4 py-3 ${
                  !selectedLineItemId ? 'bg-brand-50' : ''
                }`}
              >
                <Text className={`text-sm ${!selectedLineItemId ? 'font-semibold text-brand-600' : 'text-gray-500'}`}>
                  Uncategorized
                </Text>
              </Pressable>
              {lineItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedLineItemId(item.id)}
                  className={`border-b border-gray-50 px-4 py-3 ${
                    selectedLineItemId === item.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <Text className={`text-sm ${selectedLineItemId === item.id ? 'font-semibold text-brand-600' : 'text-gray-700'}`}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-400">{item.groupName}</Text>
                </Pressable>
              ))}
            </Card>
          </View>
        )}

        {/* Actions */}
        <View className="mt-2 space-y-3">
          <Button title="Save Changes" onPress={handleSave} loading={loading} size="lg" fullWidth />

          {!transaction.is_split && transaction.type === 'expense' && (
            <Button
              title="Split Transaction"
              onPress={handleSplit}
              variant="outline"
              icon={<Split color="#374151" size={16} />}
              size="lg"
              fullWidth
            />
          )}

          <Button
            title="Delete Transaction"
            onPress={handleDelete}
            variant="danger"
            icon={<Trash2 color="#FFFFFF" size={16} />}
            size="lg"
            fullWidth
          />
        </View>

        <View className="h-16" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
