import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budget.service';
import { useUIStore } from '../stores/uiStore';

export function useBudget() {
  const { selectedMonth, selectedYear } = useUIStore();
  const queryClient = useQueryClient();

  const budgetQuery = useQuery({
    queryKey: ['budget', selectedMonth, selectedYear],
    queryFn: () => budgetService.getBudgetWithSummary(selectedMonth, selectedYear),
    staleTime: 30_000,
  });

  const createBudgetMutation = useMutation({
    mutationFn: () => budgetService.createBudgetWithDefaults(selectedMonth, selectedYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const copyFromPreviousMonthMutation = useMutation({
    mutationFn: () => {
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      return budgetService.copyBudgetFromPreviousMonth(
        selectedMonth,
        selectedYear,
        prevMonth,
        prevYear
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: (plannedIncome: number) => {
      if (!budgetQuery.data) throw new Error('No budget');
      return budgetService.updateBudgetIncome(budgetQuery.data.id, plannedIncome);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const addCategoryGroupMutation = useMutation({
    mutationFn: ({ name, isIncome }: { name: string; isIncome: boolean }) => {
      if (!budgetQuery.data) throw new Error('No budget');
      const sortOrder = budgetQuery.data.category_groups.length;
      return budgetService.addCategoryGroup(budgetQuery.data.id, name, isIncome, sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const addLineItemMutation = useMutation({
    mutationFn: ({
      categoryGroupId,
      name,
      plannedAmount,
    }: {
      categoryGroupId: string;
      name: string;
      plannedAmount: number;
    }) => {
      if (!budgetQuery.data) throw new Error('No budget');
      return budgetService.addLineItem(categoryGroupId, budgetQuery.data.id, name, plannedAmount, 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const updateLineItemMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; planned_amount?: number };
    }) => budgetService.updateLineItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  const deleteLineItemMutation = useMutation({
    mutationFn: (id: string) => budgetService.deleteLineItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] });
    },
  });

  return {
    budget: budgetQuery.data,
    isLoading: budgetQuery.isLoading,
    error: budgetQuery.error,
    refetch: budgetQuery.refetch,
    createBudget: createBudgetMutation.mutate,
    isCreating: createBudgetMutation.isPending,
    copyFromPreviousMonth: copyFromPreviousMonthMutation.mutate,
    isCopying: copyFromPreviousMonthMutation.isPending,
    updateIncome: updateIncomeMutation.mutate,
    addCategoryGroup: addCategoryGroupMutation.mutate,
    addLineItem: addLineItemMutation.mutate,
    updateLineItem: updateLineItemMutation.mutate,
    deleteLineItem: deleteLineItemMutation.mutate,
  };
}
