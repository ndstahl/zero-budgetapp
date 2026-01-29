import type {
  CategoryGroupWithItems,
  BudgetSummary,
  LineItemWithSpent,
} from '../types/budget';

/**
 * Calculate the budget summary from category groups.
 */
export function calculateBudgetSummary(
  plannedIncome: number,
  actualIncome: number,
  groups: CategoryGroupWithItems[]
): BudgetSummary {
  let totalPlanned = 0;
  let totalSpent = 0;

  for (const group of groups) {
    if (group.is_income) continue;
    for (const item of group.line_items) {
      totalPlanned += item.planned_amount;
      totalSpent += item.spent_amount;
    }
  }

  const leftToBudget = plannedIncome - totalPlanned;
  const leftToSpend = totalPlanned - totalSpent;
  const percentSpent = totalPlanned > 0 ? totalSpent / totalPlanned : 0;

  return {
    total_income: plannedIncome,
    actual_income: actualIncome,
    total_planned: totalPlanned,
    total_spent: totalSpent,
    left_to_budget: leftToBudget,
    left_to_spend: leftToSpend,
    percent_spent: Math.min(percentSpent, 1),
  };
}

/**
 * Calculate group totals from line items.
 */
export function calculateGroupTotals(
  items: LineItemWithSpent[]
): { totalPlanned: number; totalSpent: number; totalRemaining: number } {
  let totalPlanned = 0;
  let totalSpent = 0;

  for (const item of items) {
    totalPlanned += item.planned_amount;
    totalSpent += item.spent_amount;
  }

  return {
    totalPlanned,
    totalSpent,
    totalRemaining: totalPlanned - totalSpent,
  };
}

/**
 * Determine the status color for a budget item.
 * Green = under budget, Yellow = >80%, Red = over budget.
 */
export function getBudgetStatusColor(
  planned: number,
  spent: number
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (planned === 0) return 'neutral';
  const ratio = spent / planned;
  if (ratio > 1) return 'danger';
  if (ratio > 0.8) return 'warning';
  return 'success';
}

/**
 * Calculate the progress percentage for a line item.
 */
export function getSpendingProgress(planned: number, spent: number): number {
  if (planned === 0) return 0;
  return Math.min(spent / planned, 1);
}
