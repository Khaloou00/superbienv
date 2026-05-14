import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

export function useAuthHydration() {
  const dispatch = useDispatch();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const BASE = import.meta.env.VITE_API_URL ?? '';

    const hydrate = async () => {
      try {
        const res = await fetch(`${BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok || cancelled) return;

        const { accessToken } = await res.json();

        const meRes = await fetch(`${BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        });

        if (!meRes.ok || cancelled) return;

        const { user } = await meRes.json();
        dispatch(setCredentials({ accessToken, user }));
      } catch {
        // No valid session — remain unauthenticated silently
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, [dispatch]);

  return isHydrating;
}
