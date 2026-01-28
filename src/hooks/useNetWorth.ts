import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networthService } from '../services/networth.service';

export function useNetWorth() {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['networth', 'accounts'],
    queryFn: () => networthService.getAccounts(),
  });

  const summaryQuery = useQuery({
    queryKey: ['networth', 'summary'],
    queryFn: () => networthService.getSummary(),
  });

  const createAccountMutation = useMutation({
    mutationFn: (input: {
      name: string;
      type: 'asset' | 'liability';
      subtype?: string;
      initial_balance?: number;
    }) => networthService.createAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networth'] });
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: ({ accountId, balance }: { accountId: string; balance: number }) =>
      networthService.updateBalance(accountId, balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networth'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (accountId: string) => networthService.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networth'] });
    },
  });

  const assets = (accountsQuery.data ?? []).filter((a) => a.type === 'asset');
  const liabilities = (accountsQuery.data ?? []).filter((a) => a.type === 'liability');

  return {
    accounts: accountsQuery.data ?? [],
    assets,
    liabilities,
    summary: summaryQuery.data,
    isLoading: accountsQuery.isLoading || summaryQuery.isLoading,
    createAccount: createAccountMutation.mutate,
    isCreating: createAccountMutation.isPending,
    updateBalance: updateBalanceMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    refetch: () => {
      accountsQuery.refetch();
      summaryQuery.refetch();
    },
  };
}
