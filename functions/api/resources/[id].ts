import { getAdminClient } from '../../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
  params: { id: string };
}) {
  if (context.request.method !== 'PATCH') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = getAdminClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY);
  const { id } = context.params;
  const body = await context.request.json();

  const { data: snap, error: findError } = await supabase.from('resources').select('*').eq('id', id).single();
  if (findError || !snap) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const updates: Record<string, unknown> = {};
  if (body.quantity !== undefined) updates.quantity = Number(body.quantity);
  if (body.name) updates.name = body.name;
  if (body.category) updates.category = body.category;
  if (body.unit) updates.unit = body.unit;

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase.from('resources').update(updates).eq('id', id);
    if (updateError) throw updateError;
  }

  const { data: updated } = await supabase.from('resources').select('*').eq('id', id).single();
  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}
