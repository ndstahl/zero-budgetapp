import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Fund } from '../types/common';

export interface FundContribution {
  id: string;
  fund_id: string;
  budget_id: string;
  amount: number;
  actual_amount: number;
  month: number;
  year: number;
  created_at: string;
}

export interface FundWithContributions extends Fund {
  contributions: FundContribution[];
  progress_percent: number;
}

export const fundService = {
  async getFunds(): Promise<FundWithContributions[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: funds, error } = await supabase
      .from('funds')
      .select(`
        *,
        fund_contributions (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (funds ?? []).map((fund: any) => ({
      ...fund,
      contributions: fund.fund_contributions ?? [],
      progress_percent:
        fund.target_amount > 0
          ? Math.min(fund.current_balance / fund.target_amount, 1)
          : 0,
    }));
  },

  async getFund(id: string): Promise<FundWithContributions | null> {
    const { data, error } = await supabase
      .from('funds')
      .select(`
        *,
        fund_contributions (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      contributions: data.fund_contributions ?? [],
      progress_percent:
        data.target_amount > 0
          ? Math.min(data.current_balance / data.target_amount, 1)
          : 0,
    };
  },

  async createFund(input: {
    name: string;
    target_amount: number;
    color?: string;
    icon?: string;
  }): Promise<Fund> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('funds')
      .insert({
        user_id: userId,
        name: input.name,
        target_amount: input.target_amount,
        current_balance: 0,
        color: input.color ?? '#4F46E5',
        icon: input.icon ?? 'piggy-bank',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFund(id: string, updates: Partial<Pick<Fund, 'name' | 'target_amount' | 'color' | 'icon'>>) {
    const { data, error } = await supabase
      .from('funds')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFund(id: string) {
    const { error } = await supabase
      .from('funds')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async addContribution(
    fundId: string,
    budgetId: string,
    amount: number,
    month: number,
    year: number
  ) {
    // Upsert contribution for this fund+month
    const { data: existing } = await supabase
      .from('fund_contributions')
      .select('id, actual_amount')
      .eq('fund_id', fundId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      const newActual = existing.actual_amount + amount;
      const { error } = await supabase
        .from('fund_contributions')
        .update({ actual_amount: newActual })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('fund_contributions')
        .insert({
          fund_id: fundId,
          budget_id: budgetId,
          amount: 0,
          actual_amount: amount,
          month,
          year,
        });
      if (error) throw error;
    }

    // Update fund balance
    const { data: fund } = await supabase
      .from('funds')
      .select('current_balance')
      .eq('id', fundId)
      .single();

    if (fund) {
      await supabase
        .from('funds')
        .update({
          current_balance: fund.current_balance + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fundId);
    }
  },

  async setPlannedContribution(
    fundId: string,
    budgetId: string,
    plannedAmount: number,
    month: number,
    year: number
  ) {
    const { data: existing } = await supabase
      .from('fund_contributions')
      .select('id')
      .eq('fund_id', fundId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('fund_contributions')
        .update({ amount: plannedAmount })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('fund_contributions')
        .insert({
          fund_id: fundId,
          budget_id: budgetId,
          amount: plannedAmount,
          actual_amount: 0,
          month,
          year,
        });
      if (error) throw error;
    }
  },
};
