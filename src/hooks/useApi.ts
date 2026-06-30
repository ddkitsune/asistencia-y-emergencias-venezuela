import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

const BASE_URL = '';

export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}): Promise<any> => {
      const token = await getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }

      return res.json();
    },
    [getToken]
  );

  return { apiFetch };
}
