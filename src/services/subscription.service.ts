import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { DetectedSubscription } from '../types/plaid';

export const subscriptionService = {
  async getSubscriptions(): Promise<DetectedSubscription[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('detected_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('next_expected', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async confirmSubscription(id: string) {
    const { error } = await supabase
      .from('detected_subscriptions')
      .update({ is_confirmed: true })
      .eq('id', id);

    if (error) throw error;
  },

  async dismissSubscription(id: string) {
    const { error } = await supabase
      .from('detected_subscriptions')
      .update({ is_dismissed: true })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Detect recurring transactions by analyzing the user's transaction history.
   * This calls a server-side edge function.
   */
  async detectSubscriptions(): Promise<{ detected: number }> {
    const { data, error } = await supabase.functions.invoke('detect-subscriptions', {
      body: {},
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },
};
