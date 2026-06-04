'use client';

import { useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSession, setProfile, setLoading, profile } = useAuthStore();

  useEffect(() => {
    const devRole = document.cookie.replace(/(?:(?:^|.*;\s*)dev_role\s*=\s*([^;]*).*$)|^.*$/, '$1');

    if (devRole) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profile);
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
