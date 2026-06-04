import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/models';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      isLoading: true,
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => {
        document.cookie = 'dev_role=; path=/; max-age=0';
        localStorage.removeItem('tofash-auth');
        set({ session: null, profile: null });
      },
    }),
    {
      name: 'tofash-auth',
      partialize: (state) => ({ session: state.session, profile: state.profile }),
    }
  )
);
