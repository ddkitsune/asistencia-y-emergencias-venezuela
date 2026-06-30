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

  const { data: snap, error: findError } = await supabase.from('emergencies').select('*').eq('id', id).single();
  if (findError || !snap) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const { error: updateError } = await supabase.from('emergencies').update(body).eq('id', id);
  if (updateError) throw updateError;

  if (body.status) {
    await supabase.from('notifications').insert({
      title: `Estatus Actualizado: Emergencia ${id}`,
      message: `La solicitud en ${snap.city} (${snap.category}) cambió a: ${body.status}.`,
      type: 'Coordinación',
      targetArea: snap.state,
    });
  }

  const { data: updated } = await supabase.from('emergencies').select('*').eq('id', id).single();
  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}
