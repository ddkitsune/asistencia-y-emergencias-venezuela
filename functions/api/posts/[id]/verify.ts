import { getAdminClient } from '../../../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
  params: { id: string };
}) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = getAdminClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY);
  const { id } = context.params;

  const { data: doc, error: findError } = await supabase.from('posts').select('*').eq('id', id).single();
  if (findError || !doc) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const verificationsCount = (doc.verificationsCount || 0) + 1;
  const isVerified = verificationsCount >= 3;

  const { error: updateError } = await supabase.from('posts').update({ verificationsCount, isVerified }).eq('id', id);
  if (updateError) throw updateError;

  const { data: updated } = await supabase.from('posts').select('*').eq('id', id).single();
  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}
