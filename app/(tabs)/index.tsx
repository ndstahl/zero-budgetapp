import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import { useBudget } from '../../src/hooks/useBudget';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAuthStore } from '../../src/stores/authStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { TransactionCard } from '../../src/components/transactions/TransactionCard';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { formatCurrency, formatPercent, getMonthName, formatDate } from '../../src/utils/formatters';
import { Plus, ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Wallet, X } from 'lucide-react-native';

export default function DashboardScreen() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const profile = useAuthStore((s) => s.profile);
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } = useUIStore();
  const { budget } = useBudget();

  // Calculate date range for selected month
  const dateFilters = useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0); // Last day of month
    return {
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0],
      limit: 5,
    };
  }, [selectedMonth, selectedYear]);

  const { transactions } = useTransactions(dateFilters);

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSpentModal, setShowSpentModal] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const summary = budget?.summary;

  // Get transactions by type for modals
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Calculate spending as percentage of income (more intuitive than % of budget)
  const spentPercent = summary && summary.actual_income > 0
    ? summary.total_spent / summary.actual_income
    : 0;
  const remaining = summary
    ? summary.actual_income - summary.total_spent
    : 0;

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {firstName}</Text>
          <View style={styles.monthSelector}>
            <Pressable
              onPress={goToPreviousMonth}
              style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
            >
              <ChevronLeft color={isDark ? '#9CA3AF' : '#6B7280'} size={28} />
            </Pressable>
            <Text style={styles.monthTitle}>
              {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            <Pressable
              onPress={goToNextMonth}
              style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
            >
              <ChevronRight color={isDark ? '#9CA3AF' : '#6B7280'} size={28} />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Overview Card */}
          {summary ? (
            <View style={styles.overviewCard}>
              {/* Income Row - Opens modal to view/edit incomes */}
              <Pressable
                onPress={() => setShowIncomeModal(true)}
                style={({ pressed }) => [styles.statRow, pressed && styles.statRowPressed]}
              >
                <View style={styles.statLeft}>
                  <View style={[styles.statIcon, styles.statIconIncome]}>
                    <TrendingUp color="#10B981" size={18} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Income Received</Text>
                    <Text style={styles.statHint}>Tap to view & edit</Text>
                  </View>
                </View>
                <View style={styles.statRight}>
                  <Text style={styles.incomeAmount}>
                    {formatCurrency(summary.actual_income)}
                  </Text>
                  <ChevronRight color={isDark ? '#6B7280' : '#9CA3AF'} size={16} />
                </View>
              </Pressable>

              <View style={styles.divider} />

              {/* Spent Row */}
              <Pressable
                onPress={() => setShowSpentModal(true)}
                style={({ pressed }) => [styles.statRow, pressed && styles.statRowPressed]}
              >
                <View style={styles.statLeft}>
                  <View style={[styles.statIcon, styles.statIconExpense]}>
                    <TrendingDown color="#EF4444" size={18} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={styles.statHint}>Tap to view & edit</Text>
                  </View>
                </View>
                <View style={styles.statRight}>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(summary.total_spent)}
                  </Text>
                  <ChevronRight color={isDark ? '#6B7280' : '#9CA3AF'} size={16} />
                </View>
              </Pressable>

              <View style={styles.divider} />

              {/* Remaining / Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Remaining</Text>
                  <Text style={[styles.remainingAmount, remaining < 0 && styles.negativeAmount]}>
                    {formatCurrency(remaining)}
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.min(spentPercent, 1)}
                  color={
                    spentPercent > 1
                      ? 'danger'
                      : spentPercent > 0.8
                        ? 'warning'
                        : 'success'
                  }
                  height="sm"
                />
                <Text style={styles.progressFooterText}>
                  {formatPercent(spentPercent)} of income spent
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/(tabs)/budget')}
              style={styles.emptyBudgetCard}
            >
              <Wallet color="#4F46E5" size={32} />
              <Text style={styles.emptyBudgetTitle}>Create Your Budget</Text>
              <Text style={styles.emptyBudgetText}>
                Tap here to set up your budget for this month
              </Text>
            </Pressable>
          )}

          {/* Add Transaction Button */}
          <Pressable
            onPress={() => router.push('/(stacks)/add-transaction')}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <View style={styles.addButtonContent}>
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </View>
          </Pressable>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <Pressable
                onPress={() => router.push('/(tabs)/transactions')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight color="#4F46E5" size={16} />
              </Pressable>
            </View>

            <View style={styles.transactionsList}>
              {transactions.length === 0 ? (
                <View style={styles.emptyTransactions}>
                  <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
                </View>
              ) : (
                transactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    isDark={isDark}
                    onPress={() =>
                      router.push({
                        pathname: '/(stacks)/edit-transaction',
                        params: { id: tx.id },
                      })
                    }
                  />
                ))
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Income Modal */}
      <Modal
        visible={showIncomeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowIncomeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Income</Text>
            <Pressable onPress={() => setShowIncomeModal(false)} style={styles.modalCloseButton}>
              <X color={isDark ? '#FFFFFF' : '#111827'} size={24} />
            </Pressable>
          </View>

          <View style={styles.modalSummary}>
            <Text style={styles.modalSummaryLabel}>Total Received</Text>
            <Text style={styles.modalSummaryAmount}>
              {formatCurrency(summary?.actual_income ?? 0)}
            </Text>
          </View>

          {incomeTransactions.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Text style={styles.modalEmptyText}>No income recorded yet</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalList}>
              {incomeTransactions.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    const transactionId = item.id;
                    setShowIncomeModal(false);
                    setTimeout(() => {
                      router.push({
                        pathname: '/(stacks)/edit-transaction',
                        params: { id: transactionId },
                      });
                    }, 350);
                  }}
                  style={({ pressed }) => [
                    styles.modalIncomeItem,
                    pressed && styles.modalIncomeItemPressed,
                  ]}
                >
                  <View style={styles.modalIncomeRow}>
                    <View style={styles.modalIncomeAvatar}>
                      <Text style={styles.modalIncomeAvatarText}>
                        {(item.merchant_name ?? item.description ?? '?')[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                    <View style={styles.modalIncomeMiddle}>
                      <Text style={styles.modalIncomeName} numberOfLines={1}>
                        {item.merchant_name ?? item.description ?? 'Income'}
                      </Text>
                      <Text style={styles.modalIncomeDate}>
                        {formatDate(item.date)}
                        {item.line_item_name && ` • ${item.line_item_name}`}
                      </Text>
                    </View>
                    <Text style={styles.modalIncomeAmount}>
                      +{formatCurrency(Math.abs(item.amount))}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <Pressable
              onPress={() => {
                setShowIncomeModal(false);
                setTimeout(() => {
                  router.push({
                    pathname: '/(stacks)/add-transaction',
                    params: { type: 'income' },
                  });
                }, 350);
              }}
              style={styles.modalAddButton}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.modalAddButtonText}>Add Income</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Spent Modal */}
      <Modal
        visible={showSpentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSpentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Expenses</Text>
            <Pressable onPress={() => setShowSpentModal(false)} style={styles.modalCloseButton}>
              <X color={isDark ? '#FFFFFF' : '#111827'} size={24} />
            </Pressable>
          </View>

          <View style={styles.modalSummaryExpense}>
            <Text style={styles.modalSummaryLabel}>Total Spent</Text>
            <Text style={styles.modalSummaryAmountExpense}>
              {formatCurrency(summary?.total_spent ?? 0)}
            </Text>
          </View>

          {expenseTransactions.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Text style={styles.modalEmptyText}>No expenses recorded yet</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalList}>
              {expenseTransactions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    const transactionId = item.id;
                    setShowSpentModal(false);
                    setTimeout(() => {
                      router.push({
                        pathname: '/(stacks)/edit-transaction',
                        params: { id: transactionId },
                      });
                    }, 350);
                  }}
                  style={({ pressed }) => [
                    styles.modalExpenseItem,
                    pressed && styles.modalExpenseItemPressed,
                  ]}
                >
                  <View style={styles.modalExpenseRow}>
                    <View style={styles.modalExpenseAvatar}>
                      <Text style={styles.modalExpenseAvatarText}>
                        {(item.merchant_name ?? item.description ?? '?')[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                    <View style={styles.modalExpenseMiddle}>
                      <Text style={styles.modalExpenseName} numberOfLines={1}>
                        {item.merchant_name ?? item.description ?? 'Expense'}
                      </Text>
                      <Text style={styles.modalExpenseDate}>
                        {formatDate(item.date)}
                        {item.line_item_name && ` • ${item.line_item_name}`}
                      </Text>
                    </View>
                    <Text style={styles.modalExpenseAmount}>
                      -{formatCurrency(Math.abs(item.amount))}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <Pressable
              onPress={() => {
                setShowSpentModal(false);
                setTimeout(() => {
                  router.push({
                    pathname: '/(stacks)/add-transaction',
                    params: { type: 'expense' },
                  });
                }, 350);
              }}
              style={styles.modalAddButtonExpense}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.modalAddButtonText}>Add Expense</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  monthArrow: {
    padding: 4,
    borderRadius: 20,
  },
  monthArrowPressed: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginHorizontal: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  overviewCard: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  statRowPressed: {
    backgroundColor: isDark ? '#374151' : '#F9FAFB',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statIconIncome: {
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
  },
  statIconExpense: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  statHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 6,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
    marginHorizontal: 16,
  },
  progressSection: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: isDark ? '#D1D5DB' : '#374151',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  negativeAmount: {
    color: '#EF4444',
  },
  progressFooterText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyBudgetCard: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBudgetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginTop: 12,
  },
  emptyBudgetText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 48,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
  transactionsList: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTransactions: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSummary: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
  },
  modalSummaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  modalSummaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  modalEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  modalEmptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  modalList: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  modalItemSeparator: {
    height: 8,
  },
  modalFooter: {
    padding: 16,
    paddingBottom: 34,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#374151' : '#E5E7EB',
  },
  modalAddButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  modalAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  modalIncomeItem: {
    backgroundColor: isDark ? '#283548' : '#F5F6F8',
    borderRadius: 14,
    marginBottom: 10,
  },
  modalIncomeItemPressed: {
    backgroundColor: isDark ? '#374151' : '#EBEDF0',
  },
  modalIncomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  modalIncomeAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalIncomeAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  modalIncomeMiddle: {
    flex: 1,
    marginRight: 12,
  },
  modalIncomeName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 4,
  },
  modalIncomeDate: {
    fontSize: 13,
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  modalIncomeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  // Expense modal styles
  modalSummaryExpense: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
  },
  modalSummaryAmountExpense: {
    fontSize: 32,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  modalExpenseItem: {
    backgroundColor: isDark ? '#283548' : '#F5F6F8',
    borderRadius: 14,
    marginBottom: 10,
  },
  modalExpenseItemPressed: {
    backgroundColor: isDark ? '#374151' : '#EBEDF0',
  },
  modalExpenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  modalExpenseAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: isDark ? '#374151' : '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalExpenseAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  modalExpenseMiddle: {
    flex: 1,
    marginRight: 12,
  },
  modalExpenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 4,
  },
  modalExpenseDate: {
    fontSize: 13,
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  modalExpenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  modalAddButtonExpense: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
