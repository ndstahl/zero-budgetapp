import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { usePaycheckPlanner } from '../../src/hooks/usePaycheckPlanner';
import { useBudget } from '../../src/hooks/useBudget';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { formatCurrency } from '../../src/utils/formatters';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import Toast from 'react-native-toast-message';
import { DollarSign, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function PaycheckPlannerScreen() {
  const { budget } = useBudget();
  const { plans, isLoading, createPlan, isCreating, deletePlan, setAllocation } =
    usePaycheckPlanner(budget?.id);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('Paycheck 1');
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [expectedDate, setExpectedDate] = useState('');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const lineItems = budget?.category_groups
    .filter((g) => !g.is_income)
    .flatMap((g) =>
      g.line_items.map((item) => ({
        id: item.id,
        name: item.name,
        groupName: g.name,
        plannedAmount: item.planned_amount,
      }))
    ) ?? [];

  const handleCreate = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name required' });
      return;
    }
    if (expectedAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Enter expected amount' });
      return;
    }

    createPlan(
      {
        name: name.trim(),
        expected_amount: expectedAmount,
        expected_date: expectedDate || undefined,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Paycheck plan created!' });
          setShowForm(false);
          setName('Paycheck ' + (plans.length + 2));
          setExpectedAmount(0);
          setExpectedDate('');
        },
      }
    );
  };

  const handleDelete = (id: string, planName: string) => {
    Alert.alert('Delete Plan', `Remove "${planName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlan(id) },
    ]);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">Paycheck Planner</Text>
          <Text className="text-sm text-gray-500">
            Allocate paychecks to budget items
          </Text>
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
          <Text className="mb-3 text-sm font-semibold text-gray-700">New Paycheck</Text>
          <View className="mb-3">
            <Input
              label="Name"
              placeholder="e.g. Paycheck 1, Freelance"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View className="mb-3">
            <CurrencyInput
              value={expectedAmount}
              onChangeValue={setExpectedAmount}
              label="Expected Amount"
            />
          </View>
          <View className="mb-3">
            <Input
              label="Expected Date (optional)"
              placeholder="YYYY-MM-DD"
              value={expectedDate}
              onChangeText={setExpectedDate}
            />
          </View>
          <Button
            title="Create Paycheck Plan"
            onPress={handleCreate}
            loading={isCreating}
            fullWidth
          />
        </Card>
      )}

      {/* Plans */}
      {plans.length === 0 && !showForm ? (
        <EmptyState
          title="No Paycheck Plans"
          description="Plan how each paycheck covers your budget items to avoid overspending between paychecks."
          icon={<DollarSign color="#4F46E5" size={48} />}
          actionTitle="Add First Paycheck"
          onAction={() => setShowForm(true)}
        />
      ) : (
        plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          const allocatedTotal = (plan.allocations ?? []).reduce(
            (sum, a) => sum + a.amount,
            0
          );
          const remainingToAllocate = plan.expected_amount - allocatedTotal;
          const progress = plan.expected_amount > 0 ? allocatedTotal / plan.expected_amount : 0;

          return (
            <Card key={plan.id} className="mb-3">
              <Pressable
                onPress={() =>
                  setExpandedPlan(isExpanded ? null : plan.id)
                }
                className="flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {plan.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {formatCurrency(plan.expected_amount)}
                    {plan.expected_date ? ` — ${plan.expected_date}` : ''}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => handleDelete(plan.id, plan.name)}
                    className="mr-2 p-1"
                  >
                    <Trash2 color="#EF4444" size={14} />
                  </Pressable>
                  {isExpanded ? (
                    <ChevronUp color="#6B7280" size={18} />
                  ) : (
                    <ChevronDown color="#6B7280" size={18} />
                  )}
                </View>
              </Pressable>

              {/* Allocation progress */}
              <View className="mt-3 mb-1">
                <ProgressBar
                  progress={Math.min(progress, 1)}
                  color={progress > 1 ? 'danger' : 'brand'}
                  height="sm"
                />
              </View>
              <Text className="text-xs text-gray-400">
                {formatCurrency(allocatedTotal)} allocated — {formatCurrency(remainingToAllocate)} remaining
              </Text>

              {/* Expanded: Allocations */}
              {isExpanded && (
                <View className="mt-3 border-t border-gray-100 pt-3">
                  {lineItems.map((item) => {
                    const existing = (plan.allocations ?? []).find(
                      (a) => a.line_item_id === item.id
                    );
                    return (
                      <View
                        key={item.id}
                        className="mb-2 flex-row items-center justify-between"
                      >
                        <View className="flex-1 mr-2">
                          <Text className="text-sm text-gray-700">{item.name}</Text>
                          <Text className="text-xs text-gray-400">
                            {item.groupName} — Budget: {formatCurrency(item.plannedAmount)}
                          </Text>
                        </View>
                        <View className="w-28">
                          <CurrencyInput
                            value={existing?.amount ?? 0}
                            onChangeValue={(amt) =>
                              setAllocation({
                                paycheckPlanId: plan.id,
                                lineItemId: item.id,
                                amount: amt,
                              })
                            }
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          );
        })
      )}

      <View className="h-16" />
    </ScrollView>
  );
}
