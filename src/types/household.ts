export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  household_role: 'owner' | 'member';
}

export interface HouseholdInvite {
  id: string;
  household_id: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expires_at: string;
  created_at: string;
}
