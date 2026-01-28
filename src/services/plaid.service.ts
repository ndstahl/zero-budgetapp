import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type {
  PlaidItem,
  PlaidAccount,
  PlaidItemWithAccounts,
  SyncResult,
} from '../types/plaid';

export const plaidService = {
  /**
   * Get a Plaid Link token from the Edge Function.
   * Pass an access_token to enter update mode (re-auth).
   */
  async createLinkToken(accessToken?: string): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
      body: accessToken ? { access_token: accessToken } : {},
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data.link_token;
  },

  /**
   * Exchange a Plaid public_token for an access_token (server-side).
   */
  async exchangePublicToken(
    publicToken: string,
    institutionId?: string,
    institutionName?: string
  ): Promise<{ item_id: string }> {
    const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
      body: {
        public_token: publicToken,
        institution_id: institutionId,
        institution_name: institutionName,
      },
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return { item_id: data.item_id };
  },

  /**
   * Trigger a manual sync for a specific item or all items.
   */
  async syncTransactions(itemId?: string): Promise<SyncResult> {
    const { data, error } = await supabase.functions.invoke('plaid-sync-transactions', {
      body: itemId ? { item_id: itemId } : {},
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data as SyncResult;
  },

  /**
   * Get all linked Plaid items with their accounts.
   */
  async getLinkedItems(): Promise<PlaidItemWithAccounts[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Use the safe view that excludes access_token
    const { data: items, error: itemsError } = await supabase
      .from('plaid_items_safe')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (itemsError) throw itemsError;

    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*')
      .eq('user_id', userId);

    if (accountsError) throw accountsError;

    return (items ?? []).map((item: any) => ({
      ...item,
      accounts: (accounts ?? []).filter((a: any) => a.plaid_item_id === item.id),
    }));
  },

  /**
   * Get all Plaid accounts for the current user.
   */
  async getAccounts(): Promise<PlaidAccount[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('plaid_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_hidden', false)
      .order('name');

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Toggle account visibility (hide from UI but keep syncing).
   */
  async toggleAccountVisibility(accountId: string, isHidden: boolean) {
    const { error } = await supabase
      .from('plaid_accounts')
      .update({ is_hidden: isHidden })
      .eq('id', accountId);

    if (error) throw error;
  },

  /**
   * Disconnect a Plaid item (mark as disconnected, don't delete data).
   */
  async disconnectItem(itemId: string) {
    const { error } = await supabase
      .from('plaid_items')
      .update({ status: 'disconnected' })
      .eq('id', itemId);

    if (error) throw error;
  },
};
