export interface DefaultCategoryGroup {
  name: string;
  isIncome: boolean;
  lineItems: { name: string; plannedAmount: number }[];
}

export const DEFAULT_CATEGORY_GROUPS: DefaultCategoryGroup[] = [
  {
    name: 'Income',
    isIncome: true,
    lineItems: [
      { name: 'Paycheck 1', plannedAmount: 0 },
      { name: 'Paycheck 2', plannedAmount: 0 },
    ],
  },
  {
    name: 'Housing',
    isIncome: false,
    lineItems: [
      { name: 'Mortgage/Rent', plannedAmount: 0 },
      { name: 'Utilities', plannedAmount: 0 },
      { name: 'Internet', plannedAmount: 0 },
      { name: 'Phone', plannedAmount: 0 },
    ],
  },
  {
    name: 'Transportation',
    isIncome: false,
    lineItems: [
      { name: 'Car Payment', plannedAmount: 0 },
      { name: 'Gas', plannedAmount: 0 },
      { name: 'Car Insurance', plannedAmount: 0 },
      { name: 'Maintenance', plannedAmount: 0 },
    ],
  },
  {
    name: 'Food',
    isIncome: false,
    lineItems: [
      { name: 'Groceries', plannedAmount: 0 },
      { name: 'Restaurants', plannedAmount: 0 },
    ],
  },
  {
    name: 'Personal',
    isIncome: false,
    lineItems: [
      { name: 'Clothing', plannedAmount: 0 },
      { name: 'Subscriptions', plannedAmount: 0 },
      { name: 'Entertainment', plannedAmount: 0 },
      { name: 'Personal Care', plannedAmount: 0 },
    ],
  },
  {
    name: 'Insurance & Health',
    isIncome: false,
    lineItems: [
      { name: 'Health Insurance', plannedAmount: 0 },
      { name: 'Life Insurance', plannedAmount: 0 },
      { name: 'Medical', plannedAmount: 0 },
    ],
  },
  {
    name: 'Debt',
    isIncome: false,
    lineItems: [
      { name: 'Student Loan', plannedAmount: 0 },
      { name: 'Credit Card', plannedAmount: 0 },
    ],
  },
  {
    name: 'Savings',
    isIncome: false,
    lineItems: [
      { name: 'Emergency Fund', plannedAmount: 0 },
      { name: 'Retirement', plannedAmount: 0 },
    ],
  },
  {
    name: 'Giving',
    isIncome: false,
    lineItems: [
      { name: 'Tithe/Charity', plannedAmount: 0 },
      { name: 'Gifts', plannedAmount: 0 },
    ],
  },
];
