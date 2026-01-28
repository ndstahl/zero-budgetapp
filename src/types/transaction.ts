export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionSource = 'manual' | 'plaid' | 'recurring';

export interface Transaction {
  id: string;
  user_id: string;
  household_id: string | null;
  budget_id: string | null;
  line_item_id: string | null;
  plaid_transaction_id: string | null;
  plaid_account_id: string | null;
  amount: number; // cents, positive = expense, negative = income
  merchant_name: string | null;
  description: string | null;
  date: string; // ISO date string
  pending: boolean;
  type: TransactionType;
  source: TransactionSource;
  is_split: boolean;
  parent_transaction_id: string | null;
  is_excluded: boolean;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  line_item_name?: string;
  category_group_name?: string;
}

export interface TransactionFilters {
  budget_id?: string;
  line_item_id?: string;
  type?: TransactionType;
  source?: TransactionSource;
  date_from?: string;
  date_to?: string;
  search?: string;
  uncategorized_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateTransactionInput {
  amount: number;
  merchant_name?: string;
  description?: string;
  date: string;
  type: TransactionType;
  line_item_id?: string;
  budget_id?: string;
  notes?: string;
}

export interface SplitItem {
  line_item_id: string;
  amount: number; // cents
}
