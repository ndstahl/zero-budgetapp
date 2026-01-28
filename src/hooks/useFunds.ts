import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fundService } from '../services/fund.service';
import { useUIStore } from '../stores/uiStore';

export function useFunds() {
  const queryClient = useQueryClient();

  const fundsQuery = useQuery({
    queryKey: ['funds'],
    queryFn: () => fundService.getFunds(),
    staleTime: 30_000,
  });

  const createFundMutation = useMutation({
    mutationFn: (input: { name: string; target_amount: number; color?: string; icon?: string }) =>
      fundService.createFund(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  const updateFundMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; target_amount?: number; color?: string } }) =>
      fundService.updateFund(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  const deleteFundMutation = useMutation({
    mutationFn: (id: string) => fundService.deleteFund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  const addContributionMutation = useMutation({
    mutationFn: ({
      fundId,
      budgetId,
      amount,
      month,
      year,
    }: {
      fundId: string;
      budgetId: string;
      amount: number;
      month: number;
      year: number;
    }) => fundService.addContribution(fundId, budgetId, amount, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  return {
    funds: fundsQuery.data ?? [],
    isLoading: fundsQuery.isLoading,
    error: fundsQuery.error,
    refetch: fundsQuery.refetch,
    createFund: createFundMutation.mutate,
    isCreating: createFundMutation.isPending,
    updateFund: updateFundMutation.mutate,
    deleteFund: deleteFundMutation.mutate,
    addContribution: addContributionMutation.mutate,
    isContributing: addContributionMutation.isPending,
  };
}

export function useFundDetail(fundId: string) {
  const queryClient = useQueryClient();
  const { selectedMonth, selectedYear } = useUIStore();

  const fundQuery = useQuery({
    queryKey: ['fund', fundId],
    queryFn: () => fundService.getFund(fundId),
    staleTime: 30_000,
    enabled: !!fundId,
  });

  const setPlannedMutation = useMutation({
    mutationFn: ({ plannedAmount, budgetId }: { plannedAmount: number; budgetId: string }) =>
      fundService.setPlannedContribution(fundId, budgetId, plannedAmount, selectedMonth, selectedYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund', fundId] });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
  });

  return {
    fund: fundQuery.data,
    isLoading: fundQuery.isLoading,
    setPlannedContribution: setPlannedMutation.mutate,
  };
}
