import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { getMonthShort } from '../utils/formatters';
import type { CategorySpending, MonthlyTrend, IncomeVsExpense } from '../types/reports';

const CATEGORY_COLORS = [
  '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981',
  '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316',
  '#14B8A6', '#84CC16',
];

export const reportsService = {
  /**
   * Get spending breakdown by category group for a given month/year.
   */
  async getSpendingByCategory(month: number, year: number): Promise<CategorySpending[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Get budget for this month
    const { data: budget } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (!budget) return [];

    // Get category groups with line items
    const { data: groups } = await supabase
      .from('category_groups')
      .select('id, name, is_income, line_items(id, planned_amount)')
      .eq('budget_id', budget.id)
      .eq('is_income', false)
      .order('sort_order');

    if (!groups || groups.length === 0) return [];

    // Get transactions for this budget
    const { data: transactions } = await supabase
      .from('transactions')
      .select('line_item_id, amount, is_split, parent_transaction_id')
      .eq('budget_id', budget.id)
      .eq('type', 'expense')
      .eq('is_excluded', false);

    // Build spent per line item
    const spentByLineItem = new Map<string, number>();
    for (const tx of transactions ?? []) {
      if (tx.is_split && !tx.parent_transaction_id) continue;
      if (!tx.line_item_id) continue;
      const current = spentByLineItem.get(tx.line_item_id) ?? 0;
      spentByLineItem.set(tx.line_item_id, current + Math.abs(tx.amount));
    }

    // Aggregate per category group
    const totalSpentAll = Array.from(spentByLineItem.values()).reduce((a, b) => a + b, 0);

    const result: CategorySpending[] = (groups as any[])
      .map((group, idx) => {
        const lineItemIds = (group.line_items ?? []).map((li: any) => li.id);
        const plannedAmount = (group.line_items ?? []).reduce(
          (sum: number, li: any) => sum + li.planned_amount,
          0
        );
        const totalSpent = lineItemIds.reduce(
          (sum: number, id: string) => sum + (spentByLineItem.get(id) ?? 0),
          0
        );

        return {
          categoryGroupId: group.id,
          categoryGroupName: group.name,
          totalSpent,
          plannedAmount,
          color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          percent: totalSpentAll > 0 ? totalSpent / totalSpentAll : 0,
        };
      })
      .filter((g) => g.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return result;
  },

  /**
   * Get monthly spending trends for the last N months.
   */
  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const results: MonthlyTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const { data: budget } = await supabase
        .from('budgets')
        .select('id, planned_income')
        .eq('user_id', userId)
        .eq('month', m)
        .eq('year', y)
        .maybeSingle();

      if (!budget) {
        results.push({
          month: m,
          year: y,
          label: getMonthShort(m),
          totalSpent: 0,
          totalIncome: 0,
          totalPlanned: 0,
        });
        continue;
      }

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, is_split, parent_transaction_id')
        .eq('budget_id', budget.id)
        .eq('is_excluded', false);

      let totalSpent = 0;
      let totalIncome = 0;
      for (const tx of transactions ?? []) {
        if (tx.is_split && !tx.parent_transaction_id) continue;
        if (tx.type === 'income') {
          totalIncome += Math.abs(tx.amount);
        } else {
          totalSpent += Math.abs(tx.amount);
        }
      }

      results.push({
        month: m,
        year: y,
        label: getMonthShort(m),
        totalSpent,
        totalIncome,
        totalPlanned: budget.planned_income,
      });
    }

    return results;
  },

  /**
   * Get income vs expenses for the last N months.
   */
  async getIncomeVsExpenses(months: number = 6): Promise<IncomeVsExpense[]> {
    const trends = await this.getMonthlyTrends(months);
    return trends.map((t) => ({
      month: t.month,
      year: t.year,
      label: t.label,
      income: t.totalIncome,
      expenses: t.totalSpent,
      net: t.totalIncome - t.totalSpent,
    }));
  },
};
