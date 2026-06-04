'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/Button';

const DEV_USERS = [
  {
    label: 'Customer',
    role: 'customer' as const,
    redirect: '/',
    profile: {
      id: 'dev-customer-001',
      phone: '+251911111111',
      full_name: 'Meron Tadesse',
      avatar_url: null,
      role: 'customer' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    label: 'Shop Owner',
    role: 'seller' as const,
    redirect: '/seller/dashboard',
    profile: {
      id: 'dev-seller-001',
      phone: '+251922222222',
      full_name: 'Hiwot Alemu',
      avatar_url: null,
      role: 'seller' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    label: 'Admin',
    role: 'admin' as const,
    redirect: '/admin/sellers',
    profile: {
      id: 'dev-admin-001',
      phone: '+251900000000',
      full_name: 'Tofash Admin',
      avatar_url: null,
      role: 'admin' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export default function DevLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
    }
  }, [router]);

  const loginAs = (user: (typeof DEV_USERS)[number]) => {
    document.cookie = `dev_role=${user.role}; path=/; max-age=86400`;
    setSession({
      access_token: 'dev-token',
      refresh_token: 'dev-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      expires_in: 86400,
      token_type: 'bearer',
      user: {
        id: user.profile.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: undefined,
        phone: user.profile.phone,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      },
    });
    setProfile(user.profile);
    window.location.href = user.redirect;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush-paper p-4">
      <div className="w-full max-w-sm rounded-[90px] bg-pure-white p-8 sm:p-10 text-center">
        <div className="text-5xl mb-3">🧪</div>
        <h1 className="font-display text-2xl text-coral-crimson mb-1">Dev Login</h1>
        <p className="text-sm text-coral-crimson/60 mb-8">Choose a role to test the UI</p>

        <div className="space-y-3">
          {DEV_USERS.map((user) => (
            <div key={user.role} className="rounded-[90px] border border-coral-crimson/10 p-4 text-left">
              <p className="font-medium text-coral-crimson">{user.profile.full_name}</p>
              <p className="text-xs text-coral-crimson/50 mb-3 capitalize">{user.role}</p>
              <Button
                onClick={() => loginAs(user)}
                className="w-full"
                size="sm"
              >
                Login as {user.label}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-coral-crimson/40">
          This page is only available in development mode.
        </p>
      </div>
    </div>
  );
}
