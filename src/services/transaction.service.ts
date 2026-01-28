import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type {
  Transaction,
  TransactionFilters,
  CreateTransactionInput,
  SplitItem,
} from '../types/transaction';

export const transactionService = {
  async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    let query = supabase
      .from('transactions')
      .select(`
        *,
        line_items!left (name, category_groups!inner (name))
      `)
      .eq('user_id', userId)
      .is('parent_transaction_id', null) // don't show split children in main list
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.budget_id) {
      query = query.eq('budget_id', filters.budget_id);
    }
    if (filters.line_item_id) {
      query = query.eq('line_item_id', filters.line_item_id);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }
    if (filters.uncategorized_only) {
      query = query.is('line_item_id', null);
    }
    if (filters.search) {
      query = query.or(
        `merchant_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((tx: any) => ({
      ...tx,
      line_item_name: tx.line_items?.name ?? null,
      category_group_name: tx.line_items?.category_groups?.name ?? null,
    }));
  },

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: input.type === 'income' ? -Math.abs(input.amount) : Math.abs(input.amount),
        merchant_name: input.merchant_name ?? null,
        description: input.description ?? null,
        date: input.date,
        type: input.type,
        source: 'manual',
        budget_id: input.budget_id ?? null,
        line_item_id: input.line_item_id ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<CreateTransactionInput>) {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.amount !== undefined && updates.type) {
      updateData.amount =
        updates.type === 'income' ? -Math.abs(updates.amount) : Math.abs(updates.amount);
    }
    if (updates.merchant_name !== undefined) updateData.merchant_name = updates.merchant_name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.line_item_id !== undefined) updateData.line_item_id = updates.line_item_id;
    if (updates.budget_id !== undefined) updateData.budget_id = updates.budget_id;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  async splitTransaction(transactionId: string, splits: SplitItem[]) {
    // Mark parent as split
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ is_split: true, line_item_id: null })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    // Get parent transaction
    const { data: parent, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError) throw fetchError;

    // Create child transactions
    const children = splits.map((split) => ({
      user_id: parent.user_id,
      household_id: parent.household_id,
      budget_id: parent.budget_id,
      line_item_id: split.line_item_id,
      amount: split.amount,
      merchant_name: parent.merchant_name,
      description: parent.description,
      date: parent.date,
      type: parent.type,
      source: parent.source,
      parent_transaction_id: transactionId,
    }));

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(children);

    if (insertError) throw insertError;
  },

  async categorizeTransaction(transactionId: string, lineItemId: string) {
    const { error } = await supabase
      .from('transactions')
      .update({ line_item_id: lineItemId, updated_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (error) throw error;
  },
};
