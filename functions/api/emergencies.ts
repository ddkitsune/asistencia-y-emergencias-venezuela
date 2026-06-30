import { getAdminClient } from '../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
}) {
  const { request, env } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  if (request.method === 'GET') {
    const { data, error } = await supabase.from('emergencies').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const required = ['name', 'contact', 'category', 'description', 'state', 'city', 'address'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Campo obligatorio: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    const { data: newDoc, error } = await supabase.from('emergencies').insert({
      ...body,
      status: 'Pendiente',
      allocatedResources: [],
    }).select().single();
    if (error) throw error;

    await supabase.from('notifications').insert({
      title: `🚨 NUEVA EMERGENCIA: ${body.category} en ${body.city}`,
      message: `${body.name} reporta: "${body.description?.substring(0, 80)}..." Urgencia: ${body.urgency || 'Alta'}.`,
      type: 'Alerta Crítica',
      targetArea: body.state,
    });

    return new Response(JSON.stringify(newDoc), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
