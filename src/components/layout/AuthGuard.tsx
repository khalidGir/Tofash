'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Skeleton from '@/components/ui/Skeleton';
import type { UserRole } from '@/lib/utils/constants';

interface AuthGuardProps {
 children: ReactNode;
 role: UserRole;
 fallback?: ReactNode;
}

export default function AuthGuard({ children, role, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { session, profile, isLoading } = useAuthStore();

  const devRole = typeof document !== 'undefined'
    ? document.cookie.replace(/(?:(?:^|.*;\s*)dev_role\s*=\s*([^;]*).*$)|^.*$/, '$1')
    : null;

  useEffect(() => {
  if (isLoading) return;
  if (!session && !devRole) {
  router.replace('/login');
  return;
  }
  if (profile && profile.role !== role) {
  router.replace('/');
  }
  }, [session, profile, isLoading, role, router, devRole]);

  if (isLoading) {
  return (
  <div className="flex min-h-screen items-center justify-center p-8">
  <div className="w-full max-w-md space-y-4">
  <Skeleton variant="rectangular" className="h-8 w-48" />
  <Skeleton variant="text" />
  <Skeleton variant="text" />
  <Skeleton variant="rectangular" className="h-32" />
  </div>
  </div>
  );
  }

  if (!session && !devRole) {
  return fallback ?? null;
  }

  if (profile && profile.role !== role) {
  return fallback ?? null;
  }

  return <>{children}</>;
}
