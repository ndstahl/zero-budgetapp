import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billService } from '../services/bill.service';
import type { BillReminder } from '../types/common';

export function useBillReminders() {
  const queryClient = useQueryClient();

  const billsQuery = useQuery({
    queryKey: ['bill-reminders'],
    queryFn: () => billService.getBillReminders(),
    staleTime: 60_000,
  });

  const upcomingQuery = useQuery({
    queryKey: ['upcoming-bills'],
    queryFn: () => billService.getUpcomingBills(7),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: {
      name: string;
      amount?: number;
      due_day: number;
      frequency?: BillReminder['frequency'];
      remind_days_before?: number;
      is_autopay?: boolean;
      line_item_id?: string;
    }) => billService.createBillReminder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BillReminder> }) =>
      billService.updateBillReminder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billService.deleteBillReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-bills'] });
    },
  });

  return {
    bills: billsQuery.data ?? [],
    upcomingBills: upcomingQuery.data ?? [],
    isLoading: billsQuery.isLoading,
    createBill: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateBill: updateMutation.mutate,
    deleteBill: deleteMutation.mutate,
  };
}
