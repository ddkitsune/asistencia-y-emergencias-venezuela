import { getAdminClient } from '../../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
  params: { id: string };
}) {
  const { request, env, params } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { id } = params;

  const { data: snap, error: findError } = await supabase.from('incidents').select('*').eq('id', id).single();
  if (findError || !snap) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PATCH') {
    const body = await request.json();
    const { error: updateError } = await supabase.from('incidents').update(body).eq('id', id);
    if (updateError) throw updateError;

    const { data: updated } = await supabase.from('incidents').select('*').eq('id', id).single();
    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    const { error: updateError } = await supabase.from('incidents').update({ isVerified: true }).eq('id', id);
    if (updateError) throw updateError;

    const { data: updated } = await supabase.from('incidents').select('*').eq('id', id).single();
    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
