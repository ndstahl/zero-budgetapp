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
    const body = await req.json();
    const { webhook_type, webhook_code, item_id, error } = body;

    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find the plaid item by Plaid's item_id
    const { data: plaidItem, error: lookupError } = await adminSupabase
      .from('plaid_items')
      .select('id, user_id, access_token, cursor')
      .eq('plaid_item_id', item_id)
      .maybeSingle();

    if (lookupError || !plaidItem) {
      console.error('Plaid item not found:', item_id);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle TRANSACTIONS webhooks
    if (webhook_type === 'TRANSACTIONS') {
      switch (webhook_code) {
        case 'SYNC_UPDATES_AVAILABLE': {
          // Trigger sync for this item
          await syncTransactionsForItem(adminSupabase, plaidItem);
          break;
        }
        case 'INITIAL_UPDATE':
        case 'HISTORICAL_UPDATE': {
          await syncTransactionsForItem(adminSupabase, plaidItem);
          break;
        }
        case 'TRANSACTIONS_REMOVED': {
          // removed_transaction_ids in body
          if (body.removed_transaction_ids?.length > 0) {
            await adminSupabase
              .from('transactions')
              .delete()
              .in('plaid_transaction_id', body.removed_transaction_ids);
          }
          break;
        }
      }
    }

    // Handle ITEM webhooks
    if (webhook_type === 'ITEM') {
      switch (webhook_code) {
        case 'ERROR': {
          await adminSupabase
            .from('plaid_items')
            .update({
              status: error?.error_code === 'ITEM_LOGIN_REQUIRED' ? 'login_required' : 'error',
              error_code: error?.error_code ?? null,
            })
            .eq('id', plaidItem.id);
          break;
        }
        case 'PENDING_EXPIRATION': {
          await adminSupabase
            .from('plaid_items')
            .update({ consent_expires_at: body.consent_expiration_time ?? null })
            .eq('id', plaidItem.id);
          break;
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncTransactionsForItem(
  adminSupabase: any,
  plaidItem: { id: string; user_id: string; access_token: string; cursor: string | null }
) {
  // Get user rules
  const { data: rules } = await adminSupabase
    .from('transaction_rules')
    .select('*')
    .eq('user_id', plaidItem.user_id)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  // Account map
  const { data: accounts } = await adminSupabase
    .from('plaid_accounts')
    .select('id, plaid_account_id')
    .eq('user_id', plaidItem.user_id);

  const accountMap = new Map<string, string>();
  (accounts ?? []).forEach((a: any) => accountMap.set(a.plaid_account_id, a.id));

  // Current budget
  const now = new Date();
  const { data: budget } = await adminSupabase
    .from('budgets')
    .select('id')
    .eq('user_id', plaidItem.user_id)
    .eq('month', now.getMonth() + 1)
    .eq('year', now.getFullYear())
    .maybeSingle();

  let cursor = plaidItem.cursor;
  let hasMore = true;

  while (hasMore) {
    const syncReq: Record<string, any> = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: plaidItem.access_token,
    };
    if (cursor) syncReq.cursor = cursor;

    const resp = await fetch(`${PLAID_BASE_URL}/transactions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncReq),
    });

    if (!resp.ok) break;
    const data = await resp.json();

    // Added
    if (data.added?.length > 0) {
      const inserts = data.added.map((tx: any) => ({
        user_id: plaidItem.user_id,
        budget_id: budget?.id ?? null,
        plaid_transaction_id: tx.transaction_id,
        plaid_account_id: accountMap.get(tx.account_id) ?? null,
        amount: Math.round(tx.amount * 100),
        merchant_name: tx.merchant_name ?? tx.name ?? null,
        description: tx.name ?? null,
        date: tx.date,
        pending: tx.pending ?? false,
        type: tx.amount < 0 ? 'income' : 'expense',
        source: 'plaid',
        line_item_id: matchRule(tx, rules ?? []),
      }));

      await adminSupabase
        .from('transactions')
        .upsert(inserts, { onConflict: 'plaid_transaction_id', ignoreDuplicates: false });
    }

    // Modified
    if (data.modified?.length > 0) {
      for (const tx of data.modified) {
        await adminSupabase
          .from('transactions')
          .update({
            amount: Math.round(tx.amount * 100),
            merchant_name: tx.merchant_name ?? tx.name ?? null,
            description: tx.name ?? null,
            date: tx.date,
            pending: tx.pending ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('plaid_transaction_id', tx.transaction_id);
      }
    }

    // Removed
    if (data.removed?.length > 0) {
      await adminSupabase
        .from('transactions')
        .delete()
        .in('plaid_transaction_id', data.removed.map((r: any) => r.transaction_id));
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  // Update cursor
  await adminSupabase
    .from('plaid_items')
    .update({ cursor, last_synced_at: new Date().toISOString() })
    .eq('id', plaidItem.id);
}

function matchRule(
  plaidTx: { merchant_name?: string; name?: string },
  rules: Array<{
    match_field: string;
    match_type: string;
    match_value: string;
    line_item_id: string;
  }>
): string | null {
  for (const rule of rules) {
    const val =
      rule.match_field === 'merchant_name' ? plaidTx.merchant_name : plaidTx.name;
    if (!val) continue;

    const norm = val.toLowerCase();
    const mv = rule.match_value.toLowerCase();

    if (
      (rule.match_type === 'contains' && norm.includes(mv)) ||
      (rule.match_type === 'equals' && norm === mv) ||
      (rule.match_type === 'starts_with' && norm.startsWith(mv))
    ) {
      return rule.line_item_id;
    }
  }
  return null;
}
