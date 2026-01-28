export interface PlaidItem {
  id: string;
  user_id: string;
  plaid_item_id: string;
  institution_id: string | null;
  institution_name: string | null;
  status: 'active' | 'error' | 'login_required' | 'disconnected';
  error_code: string | null;
  consent_expires_at: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface PlaidAccount {
  id: string;
  plaid_item_id: string;
  user_id: string;
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  current_balance: number | null; // cents
  available_balance: number | null; // cents
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaidItemWithAccounts extends PlaidItem {
  accounts: PlaidAccount[];
}

export interface DetectedSubscription {
  id: string;
  user_id: string;
  merchant_name: string;
  estimated_amount: number | null; // cents
  frequency: string | null;
  last_charged: string | null;
  next_expected: string | null;
  is_confirmed: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface SyncResult {
  synced: number;
  added: number;
  modified: number;
  removed: number;
}
