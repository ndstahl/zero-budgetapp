export interface CategorySpending {
  categoryGroupId: string;
  categoryGroupName: string;
  totalSpent: number; // cents
  plannedAmount: number; // cents
  color: string;
  percent: number; // 0-1
}

export interface MonthlyTrend {
  month: number;
  year: number;
  label: string; // "Jan", "Feb", etc.
  totalSpent: number; // cents
  totalIncome: number; // cents
  totalPlanned: number; // cents
}

export interface IncomeVsExpense {
  month: number;
  year: number;
  label: string;
  income: number; // cents
  expenses: number; // cents
  net: number; // cents (income - expenses)
}
