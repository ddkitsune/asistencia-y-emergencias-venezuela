import { getAdminClient } from '../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
}) {
  const { request, env } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  if (request.method === 'GET') {
    const { data, error } = await supabase.from('resources').select('*');
    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    if (!body.name || !body.category) {
      return new Response(JSON.stringify({ error: 'Campos obligatorios: name, category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { data: newDoc, error } = await supabase.from('resources').insert(body).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(newDoc), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
