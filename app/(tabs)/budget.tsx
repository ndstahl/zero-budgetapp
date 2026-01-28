import { View, ScrollView, Text, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useBudget } from '../../src/hooks/useBudget';
import { BudgetHeader } from '../../src/components/budget/BudgetHeader';
import { CategoryGroup } from '../../src/components/budget/CategoryGroup';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { Button } from '../../src/components/ui/Button';
import { Wallet } from 'lucide-react-native';

export default function BudgetScreen() {
  const {
    budget,
    isLoading,
    createBudget,
    isCreating,
    copyFromPreviousMonth,
    isCopying,
    updateLineItem,
    addLineItem,
  } = useBudget();

  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  if (isLoading) return <LoadingScreen />;

  // No budget for this month
  if (!budget) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <EmptyState
          title="No Budget Yet"
          description="Create a budget for this month to start tracking your spending."
          icon={<Wallet color="#4F46E5" size={48} />}
          actionTitle="Create Budget"
          onAction={() => createBudget()}
        />
        <View className="px-8 pb-8">
          <Button
            title="Copy from Last Month"
            onPress={() => copyFromPreviousMonth()}
            variant="outline"
            loading={isCopying}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddLineItem = (categoryGroupId: string) => {
    if (addingToGroup === categoryGroupId && newItemName.trim()) {
      addLineItem({
        categoryGroupId,
        name: newItemName.trim(),
        plannedAmount: 0,
      });
      setNewItemName('');
      setAddingToGroup(null);
    } else {
      setAddingToGroup(categoryGroupId);
      setNewItemName('');
    }
  };

  const handleUpdatePlanned = (lineItemId: string, amount: number) => {
    updateLineItem({ id: lineItemId, updates: { planned_amount: amount } });
  };

  const handlePressLineItem = (lineItemId: string) => {
    // TODO: Navigate to category detail / edit modal
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <BudgetHeader summary={budget.summary} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Category Groups */}
        {budget.category_groups
          .filter((g) => !g.is_income)
          .map((group) => (
            <View key={group.id}>
              <CategoryGroup
                group={group}
                onPressLineItem={handlePressLineItem}
                onUpdatePlanned={handleUpdatePlanned}
                onAddLineItem={handleAddLineItem}
              />

              {/* Inline add item input */}
              {addingToGroup === group.id && (
                <View className="flex-row items-center bg-white px-4 py-2">
                  <TextInput
                    className="flex-1 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm"
                    placeholder="Item name..."
                    value={newItemName}
                    onChangeText={setNewItemName}
                    autoFocus
                    onSubmitEditing={() => handleAddLineItem(group.id)}
                    returnKeyType="done"
                  />
                  <View className="ml-2">
                    <Button
                      title="Add"
                      onPress={() => handleAddLineItem(group.id)}
                      size="sm"
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
