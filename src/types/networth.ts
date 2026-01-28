export interface NetWorthAccount {
  id: string;
  user_id: string;
  household_id: string | null;
  name: string;
  type: 'asset' | 'liability';
  subtype: string | null;
  plaid_account_id: string | null;
  is_manual: boolean;
  created_at: string;
  // Joined / computed
  latest_balance?: number | null; // cents
}

export interface NetWorthSnapshot {
  id: string;
  account_id: string;
  balance: number; // cents
  snapshot_date: string;
  source: 'manual' | 'plaid';
  created_at: string;
}

export interface NetWorthSummary {
  total_assets: number; // cents
  total_liabilities: number; // cents
  net_worth: number; // cents
  history: NetWorthHistoryPoint[];
}

export interface NetWorthHistoryPoint {
  date: string;
  assets: number;
  liabilities: number;
  net_worth: number;
}
