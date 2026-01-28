import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { TransactionRule } from '../types/common';

export const ruleService = {
  async getRules(): Promise<TransactionRule[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transaction_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async createRule(input: {
    match_field: TransactionRule['match_field'];
    match_type: TransactionRule['match_type'];
    match_value: string;
    line_item_id: string;
    priority?: number;
  }): Promise<TransactionRule> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transaction_rules')
      .insert({
        user_id: userId,
        match_field: input.match_field,
        match_type: input.match_type,
        match_value: input.match_value,
        line_item_id: input.line_item_id,
        priority: input.priority ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRule(id: string, updates: Partial<TransactionRule>) {
    const { data, error } = await supabase
      .from('transaction_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRule(id: string) {
    const { error } = await supabase
      .from('transaction_rules')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
