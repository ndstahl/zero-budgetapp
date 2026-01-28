import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth.service';

export function useAuth() {
  const { session, user, profile, isLoading, setSession, setProfile, setLoading } =
    useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        authService.getProfile(session.user.id).then((profile) => {
          setProfile(profile);
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setProfile, setLoading]);

  return {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated: !!session,
    isPremium: useAuthStore.getState().isPremium(),
  };
}
