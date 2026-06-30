import { createClient } from '@supabase/supabase-js';

let adminClient: any = null;

export function getAdminClient(supabaseUrl: string, serviceRoleKey: string): any {
  if (adminClient) return adminClient;
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return adminClient;
}

export async function verifyToken(supabaseUrl: string, anonKey: string, token: string) {
  const client: any = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new Error('Token inválido o expirado');
  return user;
}
