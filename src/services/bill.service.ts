import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { BillReminder } from '../types/common';

export const billService = {
  async getBillReminders(): Promise<BillReminder[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bill_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('due_day', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async getUpcomingBills(daysAhead: number = 7): Promise<BillReminder[]> {
    const allBills = await this.getBillReminders();
    const today = new Date();
    const currentDay = today.getDate();

    return allBills.filter((bill) => {
      const diff = bill.due_day - currentDay;
      // Handle month wrap (e.g., today is 28th, bill is 3rd)
      const adjustedDiff = diff < 0 ? diff + 30 : diff;
      return adjustedDiff >= 0 && adjustedDiff <= daysAhead;
    });
  },

  async createBillReminder(input: {
    name: string;
    amount?: number;
    due_day: number;
    frequency?: BillReminder['frequency'];
    remind_days_before?: number;
    is_autopay?: boolean;
    line_item_id?: string;
  }): Promise<BillReminder> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bill_reminders')
      .insert({
        user_id: userId,
        name: input.name,
        amount: input.amount ?? null,
        due_day: input.due_day,
        frequency: input.frequency ?? 'monthly',
        remind_days_before: input.remind_days_before ?? 3,
        is_autopay: input.is_autopay ?? false,
        line_item_id: input.line_item_id ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBillReminder(id: string, updates: Partial<BillReminder>) {
    const { data, error } = await supabase
      .from('bill_reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBillReminder(id: string) {
    const { error } = await supabase
      .from('bill_reminders')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
