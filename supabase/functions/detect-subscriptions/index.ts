import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch last 90 days of expense transactions
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: txError } = await adminSupabase
      .from('transactions')
      .select('merchant_name, amount, date')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
      .not('merchant_name', 'is', null)
      .order('date', { ascending: true });

    if (txError) throw txError;

    // Group by merchant name (case-insensitive)
    const merchantGroups = new Map<string, Array<{ amount: number; date: string }>>();
    for (const tx of transactions ?? []) {
      const key = (tx.merchant_name as string).toLowerCase().trim();
      if (!merchantGroups.has(key)) merchantGroups.set(key, []);
      merchantGroups.get(key)!.push({ amount: tx.amount, date: tx.date });
    }

    // Detect recurring patterns: merchants with 2+ charges, consistent amounts
    const detectedSubs: Array<{
      merchant_name: string;
      estimated_amount: number;
      frequency: string;
      last_charged: string;
      next_expected: string;
    }> = [];

    for (const [merchant, charges] of merchantGroups) {
      if (charges.length < 2) continue;

      // Check amount consistency (within 10% tolerance)
      const amounts = charges.map((c) => c.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const isConsistentAmount = amounts.every(
        (a) => Math.abs(a - avgAmount) / avgAmount < 0.1
      );

      if (!isConsistentAmount) continue;

      // Check interval consistency
      const dates = charges.map((c) => new Date(c.date).getTime()).sort((a, b) => a - b);
      const intervals: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push(Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)));
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      let frequency: string | null = null;
      if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly';
      else if (avgInterval >= 12 && avgInterval <= 16) frequency = 'biweekly';
      else if (avgInterval >= 5 && avgInterval <= 9) frequency = 'weekly';
      else if (avgInterval >= 85 && avgInterval <= 95) frequency = 'quarterly';
      else if (avgInterval >= 350 && avgInterval <= 380) frequency = 'annual';

      if (!frequency) continue;

      // Calculate next expected date
      const lastCharged = charges[charges.length - 1].date;
      const lastDate = new Date(lastCharged);
      const nextDate = new Date(lastDate);
      switch (frequency) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'annual':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      // Use the original casing from the most recent transaction
      const originalName = charges[charges.length - 1] as any;
      const displayName = (transactions ?? []).find(
        (t) => (t.merchant_name as string).toLowerCase().trim() === merchant
      )?.merchant_name ?? merchant;

      detectedSubs.push({
        merchant_name: displayName as string,
        estimated_amount: Math.round(avgAmount),
        frequency,
        last_charged: lastCharged,
        next_expected: nextDate.toISOString().split('T')[0],
      });
    }

    // Upsert detected subscriptions (avoid duplicates by merchant)
    let insertedCount = 0;
    for (const sub of detectedSubs) {
      const { data: existing } = await adminSupabase
        .from('detected_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .ilike('merchant_name', sub.merchant_name)
        .maybeSingle();

      if (existing) {
        await adminSupabase
          .from('detected_subscriptions')
          .update({
            estimated_amount: sub.estimated_amount,
            frequency: sub.frequency,
            last_charged: sub.last_charged,
            next_expected: sub.next_expected,
          })
          .eq('id', existing.id);
      } else {
        await adminSupabase.from('detected_subscriptions').insert({
          user_id: user.id,
          ...sub,
        });
        insertedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        detected: detectedSubs.length,
        new: insertedCount,
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
