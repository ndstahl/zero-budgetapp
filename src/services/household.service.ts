import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Household, HouseholdMember, HouseholdInvite } from '../types/household';

export const householdService = {
  async getHousehold(): Promise<{
    household: Household | null;
    members: HouseholdMember[];
    invites: HouseholdInvite[];
  }> {
    const profile = useAuthStore.getState().profile;
    if (!profile?.household_id) {
      return { household: null, members: [], invites: [] };
    }

    const { data: household, error: hError } = await supabase
      .from('households')
      .select('*')
      .eq('id', profile.household_id)
      .single();

    if (hError) throw hError;

    // Get members
    const { data: members, error: mError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, household_role')
      .eq('household_id', profile.household_id);

    if (mError) throw mError;

    // Get pending invites (owner only)
    let invites: HouseholdInvite[] = [];
    if (profile.household_role === 'owner') {
      const { data, error: iError } = await supabase
        .from('household_invites')
        .select('*')
        .eq('household_id', profile.household_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!iError) invites = data ?? [];
    }

    return { household, members: members ?? [], invites };
  },

  async createHousehold(name: string): Promise<Household> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('households')
      .insert({ name, owner_id: userId })
      .select()
      .single();

    if (error) throw error;

    // Update profile with household_id
    await supabase
      .from('profiles')
      .update({ household_id: data.id, household_role: 'owner' })
      .eq('id', userId);

    return data;
  },

  async inviteMember(email: string): Promise<HouseholdInvite> {
    const profile = useAuthStore.getState().profile;
    if (!profile?.household_id) throw new Error('No household');
    if (profile.household_role !== 'owner') throw new Error('Only owners can invite');

    // Generate a secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const { data, error } = await supabase
      .from('household_invites')
      .insert({
        household_id: profile.household_id,
        invited_email: email.toLowerCase().trim(),
        status: 'pending',
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async acceptInvite(token: string): Promise<void> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Find invite
    const { data: invite, error: findError } = await supabase
      .from('household_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !invite) throw new Error('Invalid or expired invite');

    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('household_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);
      throw new Error('Invite has expired');
    }

    // Update profile to join household
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ household_id: invite.household_id, household_role: 'member' })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Mark invite accepted
    await supabase
      .from('household_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id);
  },

  async removeMember(memberId: string): Promise<void> {
    const profile = useAuthStore.getState().profile;
    if (!profile?.household_id) throw new Error('No household');
    if (profile.household_role !== 'owner') throw new Error('Only owners can remove members');

    const { error } = await supabase
      .from('profiles')
      .update({ household_id: null, household_role: 'member' })
      .eq('id', memberId);

    if (error) throw error;
  },

  async leaveHousehold(): Promise<void> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ household_id: null, household_role: 'member' })
      .eq('id', userId);

    if (error) throw error;
  },

  async cancelInvite(inviteId: string): Promise<void> {
    const { error } = await supabase
      .from('household_invites')
      .delete()
      .eq('id', inviteId);

    if (error) throw error;
  },
};
