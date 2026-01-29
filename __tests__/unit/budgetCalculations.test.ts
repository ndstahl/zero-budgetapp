import {
  calculateBudgetSummary,
  calculateGroupTotals,
  getBudgetStatusColor,
  getSpendingProgress,
} from '../../src/utils/budgetCalculations';

describe('calculateBudgetSummary', () => {
  it('returns zero summary for empty groups', () => {
    const result = calculateBudgetSummary(500000, 0, []);
    expect(result.total_income).toBe(500000);
    expect(result.actual_income).toBe(0);
    expect(result.total_planned).toBe(0);
    expect(result.total_spent).toBe(0);
    expect(result.left_to_budget).toBe(500000);
    expect(result.left_to_spend).toBe(0);
    expect(result.percent_spent).toBe(0);
  });

  it('skips income groups in totals', () => {
    const groups = [
      {
        id: '1',
        budget_id: 'b1',
        name: 'Income',
        sort_order: 0,
        is_income: true,
        created_at: '',
        line_items: [
          {
            id: 'li1',
            category_group_id: '1',
            budget_id: 'b1',
            name: 'Salary',
            planned_amount: 500000,
            sort_order: 0,
            is_fund: false,
            fund_target: null,
            due_date: null,
            is_recurring: false,
            created_at: '',
            updated_at: '',
            spent_amount: 500000,
            remaining_amount: 0,
          },
        ],
      },
      {
        id: '2',
        budget_id: 'b1',
        name: 'Housing',
        sort_order: 1,
        is_income: false,
        created_at: '',
        line_items: [
          {
            id: 'li2',
            category_group_id: '2',
            budget_id: 'b1',
            name: 'Rent',
            planned_amount: 150000,
            sort_order: 0,
            is_fund: false,
            fund_target: null,
            due_date: null,
            is_recurring: true,
            created_at: '',
            updated_at: '',
            spent_amount: 150000,
            remaining_amount: 0,
          },
        ],
      },
    ];
    const result = calculateBudgetSummary(500000, 450000, groups as any);
    expect(result.total_planned).toBe(150000);
    expect(result.total_spent).toBe(150000);
    expect(result.left_to_budget).toBe(350000);
    expect(result.actual_income).toBe(450000);
  });

  it('caps percent_spent at 1', () => {
    const groups = [
      {
        id: '1',
        budget_id: 'b1',
        name: 'Food',
        sort_order: 0,
        is_income: false,
        created_at: '',
        line_items: [
          {
            id: 'li1',
            category_group_id: '1',
            budget_id: 'b1',
            name: 'Groceries',
            planned_amount: 10000,
            sort_order: 0,
            is_fund: false,
            fund_target: null,
            due_date: null,
            is_recurring: false,
            created_at: '',
            updated_at: '',
            spent_amount: 20000,
            remaining_amount: -10000,
          },
        ],
      },
    ];
    const result = calculateBudgetSummary(50000, 50000, groups as any);
    expect(result.percent_spent).toBe(1);
  });
});

describe('calculateGroupTotals', () => {
  it('sums planned, spent, and computes remaining', () => {
    const items = [
      { planned_amount: 10000, spent_amount: 3000 },
      { planned_amount: 5000, spent_amount: 5000 },
    ];
    const result = calculateGroupTotals(items as any);
    expect(result.totalPlanned).toBe(15000);
    expect(result.totalSpent).toBe(8000);
    expect(result.totalRemaining).toBe(7000);
  });

  it('handles empty array', () => {
    const result = calculateGroupTotals([]);
    expect(result.totalPlanned).toBe(0);
    expect(result.totalSpent).toBe(0);
    expect(result.totalRemaining).toBe(0);
  });
});

describe('getBudgetStatusColor', () => {
  it('returns neutral for zero planned', () => {
    expect(getBudgetStatusColor(0, 0)).toBe('neutral');
  });

  it('returns success when under 80%', () => {
    expect(getBudgetStatusColor(10000, 5000)).toBe('success');
  });

  it('returns warning between 80-100%', () => {
    expect(getBudgetStatusColor(10000, 8500)).toBe('warning');
  });

  it('returns danger when over budget', () => {
    expect(getBudgetStatusColor(10000, 11000)).toBe('danger');
  });
});

describe('getSpendingProgress', () => {
  it('returns 0 for zero planned', () => {
    expect(getSpendingProgress(0, 100)).toBe(0);
  });

  it('caps at 1.0', () => {
    expect(getSpendingProgress(100, 200)).toBe(1);
  });

  it('returns correct ratio', () => {
    expect(getSpendingProgress(10000, 7500)).toBe(0.75);
  });
});
