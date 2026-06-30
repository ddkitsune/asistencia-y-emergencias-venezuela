import { getAdminClient } from '../../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
}) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = getAdminClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('notifications').update({ isRead: true }).eq('isRead', false);
  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
