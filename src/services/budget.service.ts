import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { calculateBudgetSummary } from '../utils/budgetCalculations';
import { DEFAULT_CATEGORY_GROUPS } from '../constants/defaultCategories';
import type { Budget, BudgetWithGroups, CategoryGroupWithItems, LineItemWithSpent } from '../types/budget';

export const budgetService = {
  async getBudgetWithSummary(month: number, year: number): Promise<BudgetWithGroups | null> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Get budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (budgetError) {
      if (budgetError.code === 'PGRST116') return null; // no budget for this month
      throw budgetError;
    }

    // Get category groups with line items
    const { data: groups, error: groupsError } = await supabase
      .from('category_groups')
      .select(`
        *,
        line_items (*)
      `)
      .eq('budget_id', budget.id)
      .order('sort_order', { ascending: true });

    if (groupsError) throw groupsError;

    // Get all transactions for this budget
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('line_item_id, amount, is_split, parent_transaction_id')
      .eq('budget_id', budget.id)
      .eq('is_excluded', false);

    if (txError) throw txError;

    // Build spent amounts per line item
    const spentByLineItem = new Map<string, number>();
    for (const tx of transactions ?? []) {
      // Skip parent split transactions (children carry the amounts)
      if (tx.is_split && !tx.parent_transaction_id) continue;
      if (!tx.line_item_id) continue;
      const current = spentByLineItem.get(tx.line_item_id) ?? 0;
      spentByLineItem.set(tx.line_item_id, current + Math.abs(tx.amount));
    }

    // Assemble groups with computed spent/remaining
    const categoryGroups: CategoryGroupWithItems[] = (groups ?? []).map((group) => {
      const lineItems: LineItemWithSpent[] = (group.line_items ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((item: any) => {
          const spent = spentByLineItem.get(item.id) ?? 0;
          return {
            ...item,
            spent_amount: spent,
            remaining_amount: item.planned_amount - spent,
          };
        });

      return {
        ...group,
        line_items: lineItems,
      };
    });

    const summary = calculateBudgetSummary(budget.planned_income, categoryGroups);

    return {
      ...budget,
      category_groups: categoryGroups,
      summary,
    };
  },

  async createBudget(month: number, year: number, plannedIncome: number = 0): Promise<Budget> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        month,
        year,
        planned_income: plannedIncome,
      })
      .select()
      .single();

    if (error) throw error;
    return budget;
  },

  async createBudgetWithDefaults(month: number, year: number): Promise<Budget> {
    const budget = await this.createBudget(month, year);

    // Create default category groups and line items
    for (let i = 0; i < DEFAULT_CATEGORY_GROUPS.length; i++) {
      const group = DEFAULT_CATEGORY_GROUPS[i];
      const { data: createdGroup, error: groupError } = await supabase
        .from('category_groups')
        .insert({
          budget_id: budget.id,
          name: group.name,
          sort_order: i,
          is_income: group.isIncome,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const lineItems = group.lineItems.map((item, idx) => ({
        category_group_id: createdGroup.id,
        budget_id: budget.id,
        name: item.name,
        planned_amount: item.plannedAmount,
        sort_order: idx,
      }));

      const { error: itemsError } = await supabase
        .from('line_items')
        .insert(lineItems);

      if (itemsError) throw itemsError;
    }

    return budget;
  },

  async copyBudgetFromPreviousMonth(
    month: number,
    year: number,
    sourceMonth: number,
    sourceYear: number
  ): Promise<Budget> {
    const source = await this.getBudgetWithSummary(sourceMonth, sourceYear);
    if (!source) throw new Error('Source budget not found');

    const newBudget = await this.createBudget(month, year, source.planned_income);

    for (const group of source.category_groups) {
      const { data: newGroup, error: groupError } = await supabase
        .from('category_groups')
        .insert({
          budget_id: newBudget.id,
          name: group.name,
          sort_order: group.sort_order,
          is_income: group.is_income,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const lineItems = group.line_items.map((item) => ({
        category_group_id: newGroup.id,
        budget_id: newBudget.id,
        name: item.name,
        planned_amount: item.planned_amount,
        sort_order: item.sort_order,
        is_fund: item.is_fund,
        fund_target: item.fund_target,
        due_date: item.due_date,
        is_recurring: item.is_recurring,
      }));

      if (lineItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('line_items')
          .insert(lineItems);
        if (itemsError) throw itemsError;
      }
    }

    return newBudget;
  },

  async updateBudgetIncome(budgetId: string, plannedIncome: number) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ planned_income: plannedIncome, updated_at: new Date().toISOString() })
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addCategoryGroup(budgetId: string, name: string, isIncome: boolean, sortOrder: number) {
    const { data, error } = await supabase
      .from('category_groups')
      .insert({ budget_id: budgetId, name, is_income: isIncome, sort_order: sortOrder })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addLineItem(
    categoryGroupId: string,
    budgetId: string,
    name: string,
    plannedAmount: number,
    sortOrder: number
  ) {
    const { data, error } = await supabase
      .from('line_items')
      .insert({
        category_group_id: categoryGroupId,
        budget_id: budgetId,
        name,
        planned_amount: plannedAmount,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLineItem(id: string, updates: { name?: string; planned_amount?: number; sort_order?: number }) {
    const { data, error } = await supabase
      .from('line_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLineItem(id: string) {
    const { error } = await supabase
      .from('line_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCategoryGroup(id: string) {
    const { error } = await supabase
      .from('category_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
