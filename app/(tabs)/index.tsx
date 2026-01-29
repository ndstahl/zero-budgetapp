import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useBudget } from '../../src/hooks/useBudget';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAuthStore } from '../../src/stores/authStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { TransactionCard } from '../../src/components/transactions/TransactionCard';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { formatCurrency, formatPercent, getMonthName } from '../../src/utils/formatters';
import { Plus, ChevronRight, TrendingUp, TrendingDown, Wallet, X } from 'lucide-react-native';

export default function DashboardScreen() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const profile = useAuthStore((s) => s.profile);
  const { selectedMonth, selectedYear } = useUIStore();
  const { budget } = useBudget();
  const { transactions } = useTransactions({ limit: 5 });

  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const summary = budget?.summary;

  // Get income transactions for the modal
  const incomeTransactions = transactions.filter(t => t.type === 'income');

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
          <Text style={styles.monthTitle}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
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
                onPress={() => router.push('/(tabs)/transactions')}
                style={({ pressed }) => [styles.statRow, pressed && styles.statRowPressed]}
              >
                <View style={styles.statLeft}>
                  <View style={[styles.statIcon, styles.statIconExpense]}>
                    <TrendingDown color="#EF4444" size={18} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={styles.statHint}>Tap to view transactions</Text>
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
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>Add Transaction</Text>
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
            <FlatList
              data={incomeTransactions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              ItemSeparatorComponent={() => <View style={styles.modalItemSeparator} />}
              renderItem={({ item }) => (
                <TransactionCard
                  transaction={item}
                  isDark={isDark}
                  onPress={() => {
                    setShowIncomeModal(false);
                    router.push({
                      pathname: '/(stacks)/edit-transaction',
                      params: { id: item.id },
                    });
                  }}
                />
              )}
            />
          )}

          <View style={styles.modalFooter}>
            <Pressable
              onPress={() => {
                setShowIncomeModal(false);
                router.push('/(stacks)/add-transaction');
              }}
              style={styles.modalAddButton}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.modalAddButtonText}>Add Income</Text>
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
  monthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  overviewCard: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 20,
    padding: 4,
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
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  addButtonPressed: {
    opacity: 0.9,
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
});
