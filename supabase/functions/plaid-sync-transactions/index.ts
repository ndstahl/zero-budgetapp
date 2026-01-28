import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID')!;
const PLAID_SECRET = Deno.env.get('PLAID_SECRET')!;
const PLAID_ENV = Deno.env.get('PLAID_ENV') ?? 'sandbox';
const PLAID_BASE_URL =
  PLAID_ENV === 'production'
    ? 'https://production.plaid.com'
    : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const itemId = body.item_id; // our plaid_items.id (UUID)

    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Build query for items to sync
    let itemsQuery = adminSupabase
      .from('plaid_items')
      .select('id, plaid_item_id, access_token, cursor, user_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (itemId) {
      itemsQuery = itemsQuery.eq('id', itemId);
    }

    const { data: items, error: itemsError } = await itemsQuery;
    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: 'No active items' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's transaction rules for auto-categorization
    const { data: rules } = await adminSupabase
      .from('transaction_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Build a map of plaid_account_id -> our plaid_accounts row
    const { data: plaidAccounts } = await adminSupabase
      .from('plaid_accounts')
      .select('id, plaid_account_id')
      .eq('user_id', user.id);

    const accountMap = new Map<string, string>();
    (plaidAccounts ?? []).forEach((a: any) => {
      accountMap.set(a.plaid_account_id, a.id);
    });

    // Get user's current budget for the transaction month
    const now = new Date();
    const { data: currentBudget } = await adminSupabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear())
      .maybeSingle();

    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    for (const item of items) {
      let hasMore = true;
      let cursor = item.cursor;

      while (hasMore) {
        const syncRequest: Record<string, any> = {
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          access_token: item.access_token,
        };
        if (cursor) {
          syncRequest.cursor = cursor;
        }

        const syncResponse = await fetch(`${PLAID_BASE_URL}/transactions/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncRequest),
        });

        const syncData = await syncResponse.json();
        if (!syncResponse.ok) {
          // Update item status on error
          await adminSupabase
            .from('plaid_items')
            .update({
              status: syncData.error_code === 'ITEM_LOGIN_REQUIRED' ? 'login_required' : 'error',
              error_code: syncData.error_code ?? null,
            })
            .eq('id', item.id);
          break;
        }

        const { added, modified, removed, next_cursor, has_more } = syncData;

        // Process added transactions
        if (added && added.length > 0) {
          const inserts = added.map((tx: any) => {
            const lineItemId = matchRule(tx, rules ?? []);
            return {
              user_id: user.id,
              budget_id: currentBudget?.id ?? null,
              plaid_transaction_id: tx.transaction_id,
              plaid_account_id: accountMap.get(tx.account_id) ?? null,
              amount: Math.round(tx.amount * 100), // Plaid: positive = debit
              merchant_name: tx.merchant_name ?? tx.name ?? null,
              description: tx.name ?? null,
              date: tx.date,
              pending: tx.pending ?? false,
              type: tx.amount < 0 ? 'income' : 'expense',
              source: 'plaid',
              line_item_id: lineItemId,
            };
          });

          const { error: insertError } = await adminSupabase
            .from('transactions')
            .upsert(inserts, { onConflict: 'plaid_transaction_id', ignoreDuplicates: false });

          if (!insertError) totalAdded += added.length;
        }

        // Process modified transactions
        if (modified && modified.length > 0) {
          for (const tx of modified) {
            await adminSupabase
              .from('transactions')
              .update({
                amount: Math.round(tx.amount * 100),
                merchant_name: tx.merchant_name ?? tx.name ?? null,
                description: tx.name ?? null,
                date: tx.date,
                pending: tx.pending ?? false,
                type: tx.amount < 0 ? 'income' : 'expense',
                updated_at: new Date().toISOString(),
              })
              .eq('plaid_transaction_id', tx.transaction_id);
          }
          totalModified += modified.length;
        }

        // Process removed transactions
        if (removed && removed.length > 0) {
          const removedIds = removed.map((r: any) => r.transaction_id);
          await adminSupabase
            .from('transactions')
            .delete()
            .in('plaid_transaction_id', removedIds);
          totalRemoved += removed.length;
        }

        cursor = next_cursor;
        hasMore = has_more;
      }

      // Update cursor and last_synced_at
      await adminSupabase
        .from('plaid_items')
        .update({ cursor, last_synced_at: new Date().toISOString() })
        .eq('id', item.id);
    }

    // Update account balances
    for (const item of items) {
      const balResponse = await fetch(`${PLAID_BASE_URL}/accounts/balance/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          access_token: item.access_token,
        }),
      });

      if (balResponse.ok) {
        const balData = await balResponse.json();
        for (const acct of balData.accounts ?? []) {
          await adminSupabase
            .from('plaid_accounts')
            .update({
              current_balance: acct.balances.current
                ? Math.round(acct.balances.current * 100)
                : null,
              available_balance: acct.balances.available
                ? Math.round(acct.balances.available * 100)
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq('plaid_account_id', acct.account_id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        synced: totalAdded + totalModified,
        added: totalAdded,
        modified: totalModified,
        removed: totalRemoved,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Match a Plaid transaction against user's auto-categorization rules.
 * Returns line_item_id if matched, null otherwise.
 */
function matchRule(
  plaidTx: { merchant_name?: string; name?: string },
  rules: Array<{
    match_field: string;
    match_type: string;
    match_value: string;
    line_item_id: string;
    priority: number;
  }>
): string | null {
  for (const rule of rules) {
    const fieldValue =
      rule.match_field === 'merchant_name'
        ? plaidTx.merchant_name
        : plaidTx.name;

    if (!fieldValue) continue;

    const normalized = fieldValue.toLowerCase();
    const matchVal = rule.match_value.toLowerCase();

    let matched = false;
    switch (rule.match_type) {
      case 'contains':
        matched = normalized.includes(matchVal);
        break;
      case 'equals':
        matched = normalized === matchVal;
        break;
      case 'starts_with':
        matched = normalized.startsWith(matchVal);
        break;
    }

    if (matched) return rule.line_item_id;
  }

  return null;
}
