import { getAdminClient } from '../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
}) {
  const { request, env } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  if (request.method === 'GET') {
    const { data, error } = await supabase.from('notifications').select('*').order('createdAt', { ascending: false }).limit(50);
    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    if (!body.title || !body.message || !body.type) {
      return new Response(JSON.stringify({ error: 'Faltan datos obligatorios: title, message, type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { data: newDoc, error } = await supabase.from('notifications').insert(body).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(newDoc), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
