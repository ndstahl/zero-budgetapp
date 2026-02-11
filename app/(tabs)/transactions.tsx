import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useUIStore } from '../../src/stores/uiStore';
import { getMonthName } from '../../src/utils/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { usePlaid } from '../../src/hooks/usePlaid';
import { TransactionCard } from '../../src/components/transactions/TransactionCard';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { Input } from '../../src/components/ui/Input';
import Toast from 'react-native-toast-message';
import { Plus, Search, ArrowLeftRight, RefreshCw, AlertTriangle } from 'lucide-react-native';
import type { Transaction, TransactionType } from '../../src/types/transaction';

type FilterType = 'all' | TransactionType | 'uncategorized';

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } = useUIStore();

  // Calculate date range for selected month
  const dateFilters = useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0); // Last day of month
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
  const { activeItems, errorItems, isSyncing, syncTransactions } = usePlaid();

  const hasLinkedAccounts = activeItems.length > 0;
  const hasErrors = errorItems.length > 0;

  const handleRefresh = useCallback(async () => {
    // If user has linked accounts, sync Plaid first, then refetch
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
    { key: 'uncategorized', label: 'Uncategorized' },
  ];

  const handlePressTransaction = (tx: Transaction) => {
    router.push({
      pathname: '/(stacks)/edit-transaction',
      params: { id: tx.id },
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => handlePressTransaction(item)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pb-3 pt-2">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</Text>
          <View className="flex-row items-center">
            {hasLinkedAccounts && (
              <Pressable
                onPress={() => syncTransactions(undefined)}
                disabled={isSyncing}
                className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <RefreshCw color={isSyncing ? '#9CA3AF' : '#4F46E5'} size={18} />
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push('/(stacks)/add-transaction')}
              className="h-10 w-10 items-center justify-center rounded-full bg-brand-500"
            >
              <Plus color="#FFFFFF" size={20} />
            </Pressable>
          </View>
        </View>

        {/* Month Selector */}
        <View className="mb-3 flex-row items-center justify-center">
          <Pressable
            onPress={goToPreviousMonth}
            className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-700"
          >
            <ChevronLeft color="#9CA3AF" size={24} />
          </Pressable>
          <Text className="mx-4 text-base font-semibold text-gray-900 dark:text-white">
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
          <Pressable
            onPress={goToNextMonth}
            className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-700"
          >
            <ChevronRight color="#9CA3AF" size={24} />
          </Pressable>
        </View>

        {/* Sync Status Banner */}
        {isSyncing && (
          <View className="mb-2 flex-row items-center rounded-lg bg-brand-50 dark:bg-brand-900/30 px-3 py-2">
            <RefreshCw color="#4F46E5" size={14} />
            <Text className="ml-2 text-sm text-brand-600 dark:text-brand-400">Syncing transactions...</Text>
          </View>
        )}
        {hasErrors && !isSyncing && (
          <Pressable
            onPress={() => router.push('/(stacks)/linked-accounts')}
            className="mb-2 flex-row items-center rounded-lg bg-warning-50 dark:bg-warning-500/20 px-3 py-2"
          >
            <AlertTriangle color="#F59E0B" size={14} />
            <Text className="ml-2 flex-1 text-sm text-warning-700 dark:text-warning-500">
              {errorItems.length} account{errorItems.length !== 1 ? 's' : ''} need
              attention
            </Text>
            <Text className="text-xs font-medium text-warning-600 dark:text-warning-500">Fix</Text>
          </Pressable>
        )}

        {/* Search */}
        <Input
          placeholder="Search transactions..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search color="#9CA3AF" size={18} />}
        />

        {/* Filter Chips */}
        <View className="mt-3 flex-row">
          {filterOptions.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setActiveFilter(key)}
              className={`mr-2 rounded-full px-3 py-1.5 ${
                activeFilter === key ? 'bg-brand-500' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === key ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      {isLoading ? (
        <LoadingScreen />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No Transactions"
          description="Add your first transaction to start tracking your spending."
          icon={<ArrowLeftRight color="#4F46E5" size={48} />}
          actionTitle="Add Transaction"
          onAction={() => router.push('/(stacks)/add-transaction')}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          onRefresh={handleRefresh}
          refreshing={isLoading || isSyncing}
          ItemSeparatorComponent={() => <View className="h-px bg-gray-100 dark:bg-gray-700" />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}
