import { View, ScrollView, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useBudget } from '../../src/hooks/useBudget';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { useUIStore } from '../../src/stores/uiStore';
import { BudgetHeader } from '../../src/components/budget/BudgetHeader';
import { CategoryGroup } from '../../src/components/budget/CategoryGroup';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { getMonthName } from '../../src/utils/formatters';
import { Wallet, Plus, Copy, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';

export default function BudgetScreen() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } = useUIStore();

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

  const styles = createStyles(isDark);

  if (isLoading) return <LoadingScreen />;

  // No budget for this month
  if (!budget) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Month Selector */}
        <View style={styles.monthHeader}>
          <Pressable
            onPress={goToPreviousMonth}
            style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
          >
            <ChevronLeft color={isDark ? '#9CA3AF' : '#6B7280'} size={26} />
          </Pressable>
          <Pressable style={styles.monthButton}>
            <Text style={styles.monthTitle}>{getMonthName(selectedMonth)}</Text>
            <ChevronDown color={isDark ? '#9CA3AF' : '#6B7280'} size={18} />
          </Pressable>
          <Pressable
            onPress={goToNextMonth}
            style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
          >
            <ChevronRight color={isDark ? '#9CA3AF' : '#6B7280'} size={26} />
          </Pressable>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Wallet color="#4F46E5" size={40} />
          </View>
          <Text style={styles.emptyTitle}>No Budget Yet</Text>
          <Text style={styles.emptyText}>
            Create a budget for {getMonthName(selectedMonth)} to start tracking your spending
          </Text>

          <Pressable
            onPress={() => createBudget()}
            disabled={isCreating}
            style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}
          >
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.createButtonText}>Create Budget</Text>
          </Pressable>

          <Pressable
            onPress={() => copyFromPreviousMonth()}
            disabled={isCopying}
            style={({ pressed }) => [styles.copyButton, pressed && styles.buttonPressed]}
          >
            <Copy color="#4F46E5" size={18} />
            <Text style={styles.copyButtonText}>Copy from Last Month</Text>
          </Pressable>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Month Selector */}
      <View style={styles.monthHeader}>
        <Pressable
          onPress={goToPreviousMonth}
          style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
        >
          <ChevronLeft color={isDark ? '#9CA3AF' : '#6B7280'} size={26} />
        </Pressable>
        <Pressable style={styles.monthButton}>
          <Text style={styles.monthTitle}>{getMonthName(selectedMonth)}</Text>
          <ChevronDown color={isDark ? '#9CA3AF' : '#6B7280'} size={18} />
        </Pressable>
        <Pressable
          onPress={goToNextMonth}
          style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
        >
          <ChevronRight color={isDark ? '#9CA3AF' : '#6B7280'} size={26} />
        </Pressable>
      </View>

      <BudgetHeader
        summary={budget.summary}
        plannedIncome={budget.planned_income}
        onUpdatePlannedIncome={updateIncome}
        isDark={isDark}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Income Section */}
        {budget.category_groups.filter((g) => g.is_income).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleIncome}>INCOME</Text>
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
                    isDark={isDark}
                  />
                  {addingToGroup === group.id && (
                    <View style={styles.addItemRow}>
                      <TextInput
                        style={styles.addItemInput}
                        placeholder="Item name..."
                        placeholderTextColor="#9CA3AF"
                        value={newItemName}
                        onChangeText={setNewItemName}
                        autoFocus
                        onSubmitEditing={() => handleAddLineItem(group.id)}
                        returnKeyType="done"
                      />
                      <Pressable
                        onPress={() => handleAddLineItem(group.id)}
                        style={styles.addItemButton}
                      >
                        <Text style={styles.addItemButtonText}>Add</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* Expenses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EXPENSES</Text>
          </View>

          {budget.category_groups
            .filter((g) => !g.is_income)
            .map((group) => (
              <View key={group.id}>
                <CategoryGroup
                  group={group}
                  onPressLineItem={handlePressLineItem}
                  onUpdatePlanned={handleUpdatePlanned}
                  onAddLineItem={handleAddLineItem}
                  isDark={isDark}
                />

                {addingToGroup === group.id && (
                  <View style={styles.addItemRow}>
                    <TextInput
                      style={styles.addItemInput}
                      placeholder="Item name..."
                      placeholderTextColor="#9CA3AF"
                      value={newItemName}
                      onChangeText={setNewItemName}
                      autoFocus
                      onSubmitEditing={() => handleAddLineItem(group.id)}
                      returnKeyType="done"
                    />
                    <Pressable
                      onPress={() => handleAddLineItem(group.id)}
                      style={styles.addItemButton}
                    >
                      <Text style={styles.addItemButtonText}>Add</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#FAF9F6',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
  },
  monthArrow: {
    padding: 8,
    borderRadius: 20,
  },
  monthArrowPressed: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 6,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: isDark ? '#283548' : '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  sectionTitleIncome: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#374151' : '#F3F4F6',
  },
  addItemInput: {
    flex: 1,
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: isDark ? '#FFFFFF' : '#111827',
  },
  addItemButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#4F46E5',
    gap: 8,
  },
  copyButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
