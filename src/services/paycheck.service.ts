import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export interface PaycheckPlan {
  id: string;
  user_id: string;
  budget_id: string;
  name: string;
  expected_amount: number;
  expected_date: string | null;
  created_at: string;
  allocations?: PaycheckAllocation[];
}

export interface PaycheckAllocation {
  id: string;
  paycheck_plan_id: string;
  line_item_id: string;
  amount: number;
  created_at: string;
  // Joined
  line_item_name?: string;
  group_name?: string;
}

export const paycheckService = {
  async getPaycheckPlans(budgetId: string): Promise<PaycheckPlan[]> {
    const { data, error } = await supabase
      .from('paycheck_plans')
      .select(`
        *,
        paycheck_allocations (
          *,
          line_items!inner (name, category_groups!inner (name))
        )
      `)
      .eq('budget_id', budgetId)
      .order('expected_date', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((plan: any) => ({
      ...plan,
      allocations: (plan.paycheck_allocations ?? []).map((alloc: any) => ({
        ...alloc,
        line_item_name: alloc.line_items?.name,
        group_name: alloc.line_items?.category_groups?.name,
      })),
    }));
  },

  async createPaycheckPlan(input: {
    budget_id: string;
    name: string;
    expected_amount: number;
    expected_date?: string;
  }): Promise<PaycheckPlan> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('paycheck_plans')
      .insert({
        user_id: userId,
        budget_id: input.budget_id,
        name: input.name,
        expected_amount: input.expected_amount,
        expected_date: input.expected_date ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePaycheckPlan(id: string) {
    const { error } = await supabase
      .from('paycheck_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async setAllocation(paycheckPlanId: string, lineItemId: string, amount: number) {
    // Upsert
    const { data: existing } = await supabase
      .from('paycheck_allocations')
      .select('id')
      .eq('paycheck_plan_id', paycheckPlanId)
      .eq('line_item_id', lineItemId)
      .maybeSingle();

    if (existing) {
      if (amount === 0) {
        await supabase.from('paycheck_allocations').delete().eq('id', existing.id);
      } else {
        await supabase
          .from('paycheck_allocations')
          .update({ amount })
          .eq('id', existing.id);
      }
    } else if (amount > 0) {
      await supabase.from('paycheck_allocations').insert({
        paycheck_plan_id: paycheckPlanId,
        line_item_id: lineItemId,
        amount,
      });
    }
  },
};
