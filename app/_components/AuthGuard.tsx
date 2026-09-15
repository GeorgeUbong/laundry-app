'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  type AppType,
  clearAuthState,
  getStoredToken,
  getTokenExpiryTime,
  isTokenExpired,
} from '@/lib/auth';

export function AuthGuard({
  appType,
  loginPath,
  children,
}: {
  appType: AppType;
  loginPath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const logout = () => {
      clearAuthState(appType);
      toast.info('Your session has expired. Please log in again.');
      router.replace(loginPath);
    };

    const token = getStoredToken(appType);

    if (!token) {
      logout();
      return;
    }

    if (isTokenExpired(token)) {
      logout();
      return;
    }

    const expiryTime = getTokenExpiryTime(token);

    if (expiryTime === null) {
      return;
    }

    const msUntilExpiry = Math.max(0, expiryTime - Date.now());

    timeoutRef.current = window.setTimeout(() => {
      logout();
    }, msUntilExpiry);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [appType, loginPath, router]);

  return <>{children}</>;
}
