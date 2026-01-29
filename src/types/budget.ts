export interface Budget {
  id: string;
  user_id: string;
  household_id: string | null;
  month: number;
  year: number;
  planned_income: number; // cents
  notes: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryGroup {
  id: string;
  budget_id: string;
  name: string;
  sort_order: number;
  is_income: boolean;
  created_at: string;
  // Computed / joined
  line_items?: LineItem[];
  total_planned?: number;
  total_spent?: number;
  total_remaining?: number;
}

export interface LineItem {
  id: string;
  category_group_id: string;
  budget_id: string;
  name: string;
  planned_amount: number; // cents
  sort_order: number;
  is_fund: boolean;
  fund_target: number | null; // cents
  due_date: number | null; // day of month 1-31
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  spent_amount?: number;
  remaining_amount?: number;
}

export interface BudgetSummary {
  total_income: number; // planned income
  actual_income: number; // income from transactions
  total_planned: number;
  total_spent: number;
  left_to_budget: number; // income - totalPlanned (should be 0)
  left_to_spend: number; // totalPlanned - totalSpent
  percent_spent: number;
}

export interface BudgetWithGroups extends Budget {
  category_groups: CategoryGroupWithItems[];
  summary: BudgetSummary;
}

export interface CategoryGroupWithItems extends CategoryGroup {
  line_items: LineItemWithSpent[];
}

export interface LineItemWithSpent extends LineItem {
  spent_amount: number;
  remaining_amount: number;
}
