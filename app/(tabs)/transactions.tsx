import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useUIStore } from '../../src/stores/uiStore';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { formatCurrency, getMonthName } from '../../src/utils/formatters';
import { usePlaid } from '../../src/hooks/usePlaid';
import Toast from 'react-native-toast-message';
import { Plus, Search, RefreshCw, ChevronDown, CheckCircle } from 'lucide-react-native';
import type { Transaction, TransactionType } from '../../src/types/transaction';

type FilterType = 'all' | TransactionType | 'uncategorized';

export default function TransactionsScreen() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } = useUIStore();

  const dateFilters = useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    return {
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0],
    };
  }, [selectedMonth, selectedYear]);

  const filters = {
    ...dateFilters,
    search: search || undefined,
    type: activeFilter !== 'all' && activeFilter !== 'uncategorized'
      ? (activeFilter as TransactionType)
      : undefined,
    uncategorized_only: activeFilter === 'uncategorized' ? true : undefined,
    limit: 100,
  };

  const { transactions, isLoading, refetch } = useTransactions(filters);
  const { activeItems, isSyncing, syncTransactions } = usePlaid();

  const hasLinkedAccounts = activeItems.length > 0;

  const handleRefresh = useCallback(async () => {
    if (hasLinkedAccounts) {
      try {
        await syncTransactions(undefined);
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Sync Error',
          text2: err.message ?? 'Failed to sync transactions',
        });
      }
    }
    refetch();
  }, [hasLinkedAccounts, syncTransactions, refetch]);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'expense', label: 'Expenses' },
    { key: 'income', label: 'Income' },
    { key: 'uncategorized', label: 'Review' },
  ];

  const styles = createStyles(isDark);

  // Format date to show just month/day
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Render transaction card in grid style
  const renderTransactionCard = ({ item, index }: { item: Transaction; index: number }) => {
    const isIncome = item.type === 'income';
    const initial = (item.merchant_name || item.description || '?')[0].toUpperCase();

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/(stacks)/edit-transaction', params: { id: item.id } })}
        style={({ pressed }) => [
          styles.transactionCard,
          index % 2 === 0 ? styles.cardLeft : styles.cardRight,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Merchant Initial */}
        <View style={[styles.merchantIcon, isIncome && styles.merchantIconIncome]}>
          <Text style={[styles.merchantInitial, isIncome && styles.merchantInitialIncome]}>
            {initial}
          </Text>
        </View>

        {/* Amount */}
        <Text style={[styles.transactionAmount, isIncome && styles.incomeAmount]} numberOfLines={1}>
          {isIncome ? '+' : ''}{formatCurrency(Math.abs(item.amount))}
        </Text>

        {/* Merchant Name */}
        <Text style={styles.merchantName} numberOfLines={1}>
          {item.merchant_name || item.description || 'Transaction'}
        </Text>

        {/* Date */}
        <Text style={styles.transactionDate}>
          {formatShortDate(item.date)}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {/* Search Bar Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search color="#9CA3AF" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Transactions"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Review Button (for uncategorized) */}
          <Pressable
            onPress={() => setActiveFilter(activeFilter === 'uncategorized' ? 'all' : 'uncategorized')}
            style={[
              styles.reviewButton,
              activeFilter === 'uncategorized' && styles.reviewButtonActive,
            ]}
          >
            <CheckCircle
              color={activeFilter === 'uncategorized' ? '#FFFFFF' : '#10B981'}
              size={16}
            />
            <Text style={[
              styles.reviewButtonText,
              activeFilter === 'uncategorized' && styles.reviewButtonTextActive,
            ]}>
              Review
            </Text>
          </Pressable>
        </View>

        {/* Month Selector */}
        <View style={styles.filtersRow}>
          <Pressable style={styles.monthSelector}>
            <Text style={styles.monthText}>
              {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            <ChevronDown color={isDark ? '#9CA3AF' : '#6B7280'} size={16} />
          </Pressable>

          {/* Filter Pills */}
          <View style={styles.filterPills}>
            {filterOptions.slice(0, 3).map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => setActiveFilter(key)}
                style={[
                  styles.filterPill,
                  activeFilter === key && styles.filterPillActive,
                ]}
              >
                <Text style={[
                  styles.filterPillText,
                  activeFilter === key && styles.filterPillTextActive,
                ]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Syncing indicator */}
        {isSyncing && (
          <View style={styles.syncBanner}>
            <RefreshCw color="#4F46E5" size={14} />
            <Text style={styles.syncText}>Syncing transactions...</Text>
          </View>
        )}
      </View>

      {/* Transaction Grid */}
      {transactions.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Plus color="#4F46E5" size={32} />
          </View>
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptyText}>
            Add your first transaction to start tracking
          </Text>
          <Pressable
            onPress={() => router.push('/(stacks)/add-transaction')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Add Transaction</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionCard}
          numColumns={2}
          onRefresh={handleRefresh}
          refreshing={isLoading || isSyncing}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(stacks)/add-transaction')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Plus color="#FFFFFF" size={24} />
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#FAF9F6',
  },
  header: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: isDark ? '#FFFFFF' : '#111827',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  reviewButtonActive: {
    backgroundColor: '#10B981',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  reviewButtonTextActive: {
    color: '#FFFFFF',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: isDark ? '#D1D5DB' : '#6B7280',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  syncText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  gridContainer: {
    padding: 12,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  transactionCard: {
    width: '48%',
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 6,
  },
  cardRight: {
    marginLeft: 6,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  merchantIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  merchantIconIncome: {
    backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
  },
  merchantInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  merchantInitialIncome: {
    color: '#10B981',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 4,
  },
  incomeAmount: {
    color: '#10B981',
  },
  merchantName: {
    fontSize: 13,
    fontWeight: '500',
    color: isDark ? '#D1D5DB' : '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
