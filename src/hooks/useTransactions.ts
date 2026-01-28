import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';
import { useUIStore } from '../stores/uiStore';
import type { TransactionFilters, CreateTransactionInput } from '../types/transaction';

export function useTransactions(filters: TransactionFilters = {}) {
  const queryClient = useQueryClient();
  const { selectedMonth, selectedYear } = useUIStore();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getTransactions(filters),
    staleTime: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionService.createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateTransactionInput> }) =>
      transactionService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const categorizeMutation = useMutation({
    mutationFn: ({ id, lineItemId }: { id: string; lineItemId: string }) =>
      transactionService.categorizeTransaction(id, lineItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  return {
    transactions: transactionsQuery.data ?? [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    createTransaction: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    categorizeTransaction: categorizeMutation.mutate,
  };
}
