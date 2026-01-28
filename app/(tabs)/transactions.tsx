import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
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

  const filters = {
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 pb-3 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Transactions</Text>
          <View className="flex-row items-center">
            {hasLinkedAccounts && (
              <Pressable
                onPress={() => syncTransactions(undefined)}
                disabled={isSyncing}
                className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
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

        {/* Sync Status Banner */}
        {isSyncing && (
          <View className="mb-2 flex-row items-center rounded-lg bg-brand-50 px-3 py-2">
            <RefreshCw color="#4F46E5" size={14} />
            <Text className="ml-2 text-sm text-brand-600">Syncing transactions...</Text>
          </View>
        )}
        {hasErrors && !isSyncing && (
          <Pressable
            onPress={() => router.push('/(stacks)/linked-accounts')}
            className="mb-2 flex-row items-center rounded-lg bg-warning-50 px-3 py-2"
          >
            <AlertTriangle color="#F59E0B" size={14} />
            <Text className="ml-2 flex-1 text-sm text-warning-700">
              {errorItems.length} account{errorItems.length !== 1 ? 's' : ''} need
              attention
            </Text>
            <Text className="text-xs font-medium text-warning-600">Fix</Text>
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
                activeFilter === key ? 'bg-brand-500' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === key ? 'text-white' : 'text-gray-600'
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
          ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}
