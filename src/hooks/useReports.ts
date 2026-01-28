import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import { useUIStore } from '../stores/uiStore';

export function useSpendingByCategory() {
  const { selectedMonth, selectedYear } = useUIStore();

  return useQuery({
    queryKey: ['reports', 'spending-by-category', selectedMonth, selectedYear],
    queryFn: () => reportsService.getSpendingByCategory(selectedMonth, selectedYear),
    staleTime: 60_000,
  });
}

export function useMonthlyTrends(months: number = 6) {
  return useQuery({
    queryKey: ['reports', 'monthly-trends', months],
    queryFn: () => reportsService.getMonthlyTrends(months),
    staleTime: 60_000,
  });
}

export function useIncomeVsExpenses(months: number = 6) {
  return useQuery({
    queryKey: ['reports', 'income-vs-expenses', months],
    queryFn: () => reportsService.getIncomeVsExpenses(months),
    staleTime: 60_000,
  });
}
