import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type {
  NetWorthAccount,
  NetWorthSnapshot,
  NetWorthSummary,
  NetWorthHistoryPoint,
} from '../types/networth';

export const networthService = {
  async getAccounts(): Promise<NetWorthAccount[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('net_worth_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('type')
      .order('name');

    if (error) throw error;

    // Get latest snapshot for each account
    const accounts: NetWorthAccount[] = [];
    for (const acct of data ?? []) {
      const { data: snapshot } = await supabase
        .from('net_worth_snapshots')
        .select('balance')
        .eq('account_id', acct.id)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      accounts.push({
        ...acct,
        latest_balance: snapshot?.balance ?? null,
      });
    }

    return accounts;
  },

  async createAccount(input: {
    name: string;
    type: 'asset' | 'liability';
    subtype?: string;
    initial_balance?: number;
  }): Promise<NetWorthAccount> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: account, error } = await supabase
      .from('net_worth_accounts')
      .insert({
        user_id: userId,
        name: input.name,
        type: input.type,
        subtype: input.subtype ?? null,
        is_manual: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Add initial balance snapshot if provided
    if (input.initial_balance !== undefined) {
      await supabase.from('net_worth_snapshots').insert({
        account_id: account.id,
        balance: input.initial_balance,
        snapshot_date: new Date().toISOString().split('T')[0],
        source: 'manual',
      });
    }

    return account;
  },

  async updateBalance(accountId: string, balance: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('net_worth_snapshots')
      .upsert(
        {
          account_id: accountId,
          balance,
          snapshot_date: today,
          source: 'manual',
        },
        { onConflict: 'account_id,snapshot_date' }
      );

    if (error) throw error;
  },

  async deleteAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('net_worth_accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
  },

  async getSummary(monthsBack: number = 12): Promise<NetWorthSummary> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const accounts = await this.getAccounts();

    const totalAssets = accounts
      .filter((a) => a.type === 'asset')
      .reduce((sum, a) => sum + (a.latest_balance ?? 0), 0);

    const totalLiabilities = accounts
      .filter((a) => a.type === 'liability')
      .reduce((sum, a) => sum + (a.latest_balance ?? 0), 0);

    // Build history
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const { data: snapshots, error } = await supabase
      .from('net_worth_snapshots')
      .select('account_id, balance, snapshot_date')
      .in(
        'account_id',
        accounts.map((a) => a.id)
      )
      .gte('snapshot_date', cutoffStr)
      .order('snapshot_date');

    if (error) throw error;

    const accountTypeMap = new Map<string, 'asset' | 'liability'>();
    accounts.forEach((a) => accountTypeMap.set(a.id, a.type));

    // Group snapshots by date
    const dateMap = new Map<
      string,
      { assets: Map<string, number>; liabilities: Map<string, number> }
    >();

    for (const snap of snapshots ?? []) {
      if (!dateMap.has(snap.snapshot_date)) {
        dateMap.set(snap.snapshot_date, {
          assets: new Map(),
          liabilities: new Map(),
        });
      }
      const entry = dateMap.get(snap.snapshot_date)!;
      const type = accountTypeMap.get(snap.account_id);
      if (type === 'asset') {
        entry.assets.set(snap.account_id, snap.balance);
      } else {
        entry.liabilities.set(snap.account_id, snap.balance);
      }
    }

    const history: NetWorthHistoryPoint[] = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entry]) => {
        const assets = Array.from(entry.assets.values()).reduce((a, b) => a + b, 0);
        const liabilities = Array.from(entry.liabilities.values()).reduce((a, b) => a + b, 0);
        return {
          date,
          assets,
          liabilities,
          net_worth: assets - liabilities,
        };
      });

    return {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: totalAssets - totalLiabilities,
      history,
    };
  },
};
