import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useBillReminders } from '../../src/hooks/useBillReminders';
import { useBudget } from '../../src/hooks/useBudget';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { formatCurrency } from '../../src/utils/formatters';
import Toast from 'react-native-toast-message';
import { Bell, Plus, Trash2, Calendar, CreditCard } from 'lucide-react-native';

export default function BillRemindersScreen() {
  const { bills, isLoading, createBill, isCreating, deleteBill } = useBillReminders();
  const { budget } = useBudget();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDay, setDueDay] = useState('');
  const [isAutopay, setIsAutopay] = useState(false);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);

  const lineItems = budget?.category_groups
    .filter((g) => !g.is_income)
    .flatMap((g) =>
      g.line_items.map((item) => ({ id: item.id, name: item.name, groupName: g.name }))
    ) ?? [];

  const handleCreate = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name required' });
      return;
    }
    const day = parseInt(dueDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      Toast.show({ type: 'error', text1: 'Enter a valid due day (1-31)' });
      return;
    }

    createBill(
      {
        name: name.trim(),
        amount: amount > 0 ? amount : undefined,
        due_day: day,
        is_autopay: isAutopay,
        line_item_id: selectedLineItemId ?? undefined,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Bill reminder created!' });
          setShowForm(false);
          setName('');
          setAmount(0);
          setDueDay('');
          setIsAutopay(false);
          setSelectedLineItemId(null);
        },
      }
    );
  };

  const handleDelete = (id: string, billName: string) => {
    Alert.alert('Delete Reminder', `Remove "${billName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBill(id) },
    ]);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">Bill Reminders</Text>
          <Text className="text-sm text-gray-500">Never miss a payment</Text>
        </View>
        <Button
          title="Add"
          onPress={() => setShowForm(!showForm)}
          size="sm"
          icon={<Plus color="#FFFFFF" size={14} />}
        />
      </View>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-700">New Bill Reminder</Text>
          <View className="mb-3">
            <Input
              label="Bill Name"
              placeholder="e.g. Netflix, Electric Bill"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View className="mb-3">
            <CurrencyInput
              value={amount}
              onChangeValue={setAmount}
              label="Expected Amount (optional)"
            />
          </View>
          <View className="mb-3">
            <Input
              label="Due Day (1-31)"
              placeholder="15"
              value={dueDay}
              onChangeText={setDueDay}
              keyboardType="number-pad"
            />
          </View>

          {/* Autopay toggle */}
          <Pressable
            onPress={() => setIsAutopay(!isAutopay)}
            className="mb-3 flex-row items-center"
          >
            <View
              className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                isAutopay ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
              }`}
            >
              {isAutopay && <Text className="text-xs text-white">✓</Text>}
            </View>
            <Text className="text-sm text-gray-700">Autopay enabled</Text>
          </Pressable>

          {/* Link to budget category */}
          {lineItems.length > 0 && (
            <View className="mb-3">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Budget Category (optional)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {lineItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setSelectedLineItemId(
                        selectedLineItemId === item.id ? null : item.id
                      )
                    }
                    className={`mr-2 rounded-full px-3 py-1.5 ${
                      selectedLineItemId === item.id ? 'bg-brand-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedLineItemId === item.id ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Button
            title="Create Reminder"
            onPress={handleCreate}
            loading={isCreating}
            fullWidth
          />
        </Card>
      )}

      {/* Bill List */}
      {bills.length === 0 && !showForm ? (
        <EmptyState
          title="No Bill Reminders"
          description="Add bill reminders so you never miss a payment."
          icon={<Bell color="#4F46E5" size={48} />}
          actionTitle="Add First Bill"
          onAction={() => setShowForm(true)}
        />
      ) : (
        bills.map((bill) => (
          <Card key={bill.id} className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                  <CreditCard color="#4F46E5" size={18} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{bill.name}</Text>
                  <View className="flex-row items-center mt-0.5">
                    <Calendar color="#9CA3AF" size={12} />
                    <Text className="ml-1 text-xs text-gray-400">
                      Due on the {bill.due_day}
                      {bill.due_day === 1 ? 'st' : bill.due_day === 2 ? 'nd' : bill.due_day === 3 ? 'rd' : 'th'}
                    </Text>
                    {bill.is_autopay && (
                      <Badge label="Autopay" variant="success" />
                    )}
                  </View>
                </View>
              </View>
              <View className="flex-row items-center">
                {bill.amount && (
                  <Text className="mr-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(bill.amount)}
                  </Text>
                )}
                <Pressable
                  onPress={() => handleDelete(bill.id, bill.name)}
                  className="p-1"
                >
                  <Trash2 color="#EF4444" size={16} />
                </Pressable>
              </View>
            </View>
          </Card>
        ))
      )}

      <View className="h-16" />
    </ScrollView>
  );
}
