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
    updateIncome,
  } = useBudget();

  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  if (isLoading) return <LoadingScreen />;

  // No budget for this month
  if (!budget) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <BudgetHeader
        summary={budget.summary}
        plannedIncome={budget.planned_income}
        onUpdatePlannedIncome={updateIncome}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Income Section */}
        {budget.category_groups.filter((g) => g.is_income).length > 0 && (
          <View className="mb-2">
            <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-semibold uppercase tracking-wide text-success-600 dark:text-success-400">
                Income
              </Text>
            </View>
            {budget.category_groups
              .filter((g) => g.is_income)
              .map((group) => (
                <View key={group.id}>
                  <CategoryGroup
                    group={group}
                    onPressLineItem={handlePressLineItem}
                    onUpdatePlanned={handleUpdatePlanned}
                    onAddLineItem={handleAddLineItem}
                  />
                  {addingToGroup === group.id && (
                    <View className="flex-row items-center bg-white dark:bg-gray-800 px-4 py-2">
                      <TextInput
                        className="flex-1 rounded-lg border border-brand-300 dark:border-brand-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                        placeholder="Item name..."
                        placeholderTextColor="#9CA3AF"
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
          </View>
        )}

        {/* Expense Section Header */}
        <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Expenses
          </Text>
        </View>

        {/* Expense Category Groups */}
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
                <View className="flex-row items-center bg-white dark:bg-gray-800 px-4 py-2">
                  <TextInput
                    className="flex-1 rounded-lg border border-brand-300 dark:border-brand-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    placeholder="Item name..."
                    placeholderTextColor="#9CA3AF"
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
