import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useTransactionRules } from '../../src/hooks/useTransactionRules';
import { useBudget } from '../../src/hooks/useBudget';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import Toast from 'react-native-toast-message';
import { Zap, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import type { TransactionRule } from '../../src/types/common';

type MatchField = TransactionRule['match_field'];
type MatchType = TransactionRule['match_type'];

export default function TransactionRulesScreen() {
  const { rules, isLoading, createRule, isCreating, deleteRule } = useTransactionRules();
  const { budget } = useBudget();
  const [showForm, setShowForm] = useState(false);

  // Form
  const [matchField, setMatchField] = useState<MatchField>('merchant_name');
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [matchValue, setMatchValue] = useState('');
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);

  const lineItems = budget?.category_groups
    .filter((g) => !g.is_income)
    .flatMap((g) =>
      g.line_items.map((item) => ({ id: item.id, name: item.name, groupName: g.name }))
    ) ?? [];

  const handleCreate = () => {
    if (!matchValue.trim()) {
      Toast.show({ type: 'error', text1: 'Enter a match value' });
      return;
    }
    if (!selectedLineItemId) {
      Toast.show({ type: 'error', text1: 'Select a category' });
      return;
    }

    createRule(
      {
        match_field: matchField,
        match_type: matchType,
        match_value: matchValue.trim(),
        line_item_id: selectedLineItemId,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Rule created!' });
          setShowForm(false);
          setMatchValue('');
          setSelectedLineItemId(null);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Rule', 'Remove this auto-categorization rule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRule(id) },
    ]);
  };

  const matchTypeLabels: Record<MatchType, string> = {
    contains: 'Contains',
    equals: 'Equals',
    starts_with: 'Starts with',
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">Transaction Rules</Text>
          <Text className="text-sm text-gray-500">Auto-categorize transactions</Text>
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
          <Text className="mb-3 text-sm font-semibold text-gray-700">New Rule</Text>

          {/* Match Field */}
          <Text className="mb-1.5 text-sm font-medium text-gray-700">When</Text>
          <View className="mb-3 flex-row rounded-xl bg-gray-100 p-1">
            {(['merchant_name', 'description'] as MatchField[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setMatchField(f)}
                className={`flex-1 items-center rounded-lg py-2 ${
                  matchField === f ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text className={`text-xs font-medium ${matchField === f ? 'text-gray-900' : 'text-gray-500'}`}>
                  {f === 'merchant_name' ? 'Merchant Name' : 'Description'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Match Type */}
          <View className="mb-3 flex-row">
            {(['contains', 'equals', 'starts_with'] as MatchType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setMatchType(t)}
                className={`mr-2 rounded-full px-3 py-1.5 ${
                  matchType === t ? 'bg-brand-500' : 'bg-gray-100'
                }`}
              >
                <Text className={`text-xs font-medium ${matchType === t ? 'text-white' : 'text-gray-600'}`}>
                  {matchTypeLabels[t]}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Match Value */}
          <View className="mb-3">
            <Input
              label="Match Value"
              placeholder="e.g. Starbucks, Amazon"
              value={matchValue}
              onChangeText={setMatchValue}
            />
          </View>

          {/* Category */}
          <Text className="mb-1.5 text-sm font-medium text-gray-700">
            Assign to Category
          </Text>
          <View className="mb-3 max-h-40">
            <ScrollView nestedScrollEnabled>
              {lineItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedLineItemId(item.id)}
                  className={`rounded-lg px-3 py-2 mb-1 ${
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
            </ScrollView>
          </View>

          <Button
            title="Create Rule"
            onPress={handleCreate}
            loading={isCreating}
            fullWidth
          />
        </Card>
      )}

      {/* Rule List */}
      {rules.length === 0 && !showForm ? (
        <EmptyState
          title="No Rules Yet"
          description="Create rules to automatically categorize transactions when they match merchant names or descriptions."
          icon={<Zap color="#4F46E5" size={48} />}
          actionTitle="Create First Rule"
          onAction={() => setShowForm(true)}
        />
      ) : (
        rules.map((rule) => {
          const lineItem = lineItems.find((li) => li.id === rule.line_item_id);
          return (
            <Card key={rule.id} className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center flex-wrap">
                    <Badge
                      label={rule.match_field === 'merchant_name' ? 'Merchant' : 'Description'}
                      variant="brand"
                    />
                    <Text className="mx-1 text-xs text-gray-400">
                      {matchTypeLabels[rule.match_type]}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      "{rule.match_value}"
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center">
                    <ArrowRight color="#9CA3AF" size={12} />
                    <Text className="ml-1 text-sm text-brand-600">
                      {lineItem?.name ?? 'Unknown category'}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => handleDelete(rule.id)} className="p-2">
                  <Trash2 color="#EF4444" size={16} />
                </Pressable>
              </View>
            </Card>
          );
        })
      )}

      <View className="h-16" />
    </ScrollView>
  );
}
