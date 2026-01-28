export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  household_id: string | null;
  household_role: 'owner' | 'member';
  currency_code: string;
  biometric_enabled: boolean;
  onboarding_completed: boolean;
  premium_tier: 'free' | 'premium';
  rc_customer_id: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Fund {
  id: string;
  user_id: string;
  household_id: string | null;
  name: string;
  target_amount: number; // cents
  current_balance: number; // cents
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillReminder {
  id: string;
  user_id: string;
  line_item_id: string | null;
  name: string;
  amount: number | null;
  due_day: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'quarterly' | 'annual';
  remind_days_before: number;
  is_autopay: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TransactionRule {
  id: string;
  user_id: string;
  match_field: 'merchant_name' | 'description';
  match_type: 'contains' | 'equals' | 'starts_with';
  match_value: string;
  line_item_id: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}
