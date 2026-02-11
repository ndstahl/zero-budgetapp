import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useBudget } from '../../src/hooks/useBudget';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useUIStore } from '../../src/stores/uiStore';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { SpendingArcChart, CATEGORY_COLORS } from '../../src/components/dashboard/SpendingArcChart';
import { CategorySpendingList } from '../../src/components/dashboard/CategorySpendingList';
import { formatCurrency, getMonthName, formatDate } from '../../src/utils/formatters';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

export default function DashboardScreen() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } = useUIStore();
  const { budget } = useBudget();

  const dateFilters = useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    return {
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0],
      limit: 5,
    };
  }, [selectedMonth, selectedYear]);

  const { transactions } = useTransactions(dateFilters);
  const summary = budget?.summary;

  // Calculate spending data for category list
  const categorySpendingData = useMemo(() => {
    if (!budget?.category_groups) return [];

    return budget.category_groups
      .filter((g) => !g.is_income)
      .flatMap((group, groupIndex) =>
        (group.line_items || []).map((item: any, itemIndex: number) => ({
          id: item.id,
          name: item.name,
          groupName: group.name,
          spent: item.spent || 0,
          planned: item.planned_amount || 0,
          color: CATEGORY_COLORS[(groupIndex + itemIndex) % CATEGORY_COLORS.length],
        }))
      )
      .filter((item) => item.spent > 0 || item.planned > 0);
  }, [budget]);

  // Data for arc chart (aggregate by category group)
  const arcData = useMemo(() => {
    if (!budget?.category_groups) return [];

    return budget.category_groups
      .filter((g) => !g.is_income)
      .map((group, index) => {
        const groupSpent = (group.line_items || []).reduce(
          (sum: number, item: any) => sum + (item.spent || 0),
          0
        );
        return {
          name: group.name,
          amount: groupSpent,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        };
      })
      .filter((g) => g.amount > 0);
  }, [budget]);

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Month Selector - Dollarwise Style */}
        <View style={styles.header}>
          <Pressable
            onPress={goToPreviousMonth}
            style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
          >
            <ChevronLeft color={isDark ? '#9CA3AF' : '#6B7280'} size={26} />
          </Pressable>

          <Pressable style={styles.monthButton}>
            <Text style={styles.monthTitle}>
              {getMonthName(selectedMonth)}
            </Text>
            <ChevronDown color={isDark ? '#9CA3AF' : '#6B7280'} size={18} />
          </Pressable>

          <Pressable
            onPress={goToNextMonth}
            style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}
          >
            <ChevronRight color={isDark ? '#9CA3AF' : '#6B7280'} size={26} />
          </Pressable>
        </View>

        {summary ? (
          <>
            {/* Arc Chart */}
            <SpendingArcChart
              categories={arcData}
              totalSpent={summary.total_spent}
              totalBudget={summary.total_planned > 0 ? summary.total_planned : summary.actual_income}
              isDark={isDark}
            />

            {/* Spending Categories Card */}
            <View style={styles.cardContainer}>
              <CategorySpendingList
                categories={categorySpendingData}
                isDark={isDark}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                onPress={() => router.push({ pathname: '/(stacks)/add-transaction', params: { type: 'expense' } })}
                style={({ pressed }) => [styles.actionButton, styles.expenseButton, pressed && styles.buttonPressed]}
              >
                <View style={styles.actionIconContainer}>
                  <ArrowUpRight color="#FFFFFF" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.actionButtonText}>Add Expense</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push({ pathname: '/(stacks)/add-transaction', params: { type: 'income' } })}
                style={({ pressed }) => [styles.actionButton, styles.incomeButton, pressed && styles.buttonPressed]}
              >
                <View style={styles.actionIconContainer}>
                  <ArrowDownLeft color="#FFFFFF" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.actionButtonText}>Add Income</Text>
              </Pressable>
            </View>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Activity</Text>
                  <Pressable
                    onPress={() => router.push('/(tabs)/transactions')}
                    style={styles.seeAllButton}
                  >
                    <Text style={styles.seeAllText}>View All</Text>
                    <ChevronRight color="#4F46E5" size={16} />
                  </Pressable>
                </View>

                <View style={styles.transactionsCard}>
                  {transactions.slice(0, 4).map((tx, index) => (
                    <Pressable
                      key={tx.id}
                      onPress={() => router.push({ pathname: '/(stacks)/edit-transaction', params: { id: tx.id } })}
                      style={({ pressed }) => [
                        styles.transactionRow,
                        pressed && styles.transactionRowPressed,
                        index === Math.min(transactions.length - 1, 3) && styles.lastTransaction,
                      ]}
                    >
                      <View style={[
                        styles.transactionIcon,
                        tx.type === 'income' ? styles.incomeIcon : styles.expenseIcon
                      ]}>
                        <Text style={styles.transactionIconText}>
                          {(tx.merchant_name || tx.description || '?')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionName} numberOfLines={1}>
                          {tx.merchant_name || tx.description || 'Transaction'}
                        </Text>
                        <Text style={styles.transactionDate}>{formatDate(tx.date)}</Text>
                      </View>
                      <Text style={[
                        styles.transactionAmount,
                        tx.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                      ]}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Plus color="#4F46E5" size={32} />
            </View>
            <Text style={styles.emptyTitle}>Create Your Budget</Text>
            <Text style={styles.emptyText}>
              Set up your budget for {getMonthName(selectedMonth)} to start tracking your spending
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/budget')}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Get Started</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#FAF9F6', // Warm cream background
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseButton: {
    backgroundColor: '#4F46E5',
  },
  incomeButton: {
    backgroundColor: '#10B981',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  transactionsCard: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#F3F4F6',
  },
  transactionRowPressed: {
    backgroundColor: isDark ? '#283548' : '#F9FAFB',
  },
  lastTransaction: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
  },
  expenseIcon: {
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
  },
  transactionIconText: {
    fontSize: 17,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: isDark ? '#FFFFFF' : '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
