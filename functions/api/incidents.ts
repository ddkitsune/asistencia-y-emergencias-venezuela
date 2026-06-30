import { getAdminClient } from '../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
}) {
  const { request, env } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  if (request.method === 'GET') {
    const { data, error } = await supabase.from('incidents').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const required = ['type', 'description', 'state', 'city', 'address'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Campo obligatorio: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    const { data: newDoc, error } = await supabase.from('incidents').insert({
      ...body,
      isVerified: false,
    }).select().single();
    if (error) throw error;

    await supabase.from('notifications').insert({
      title: `🚨 ALERTA DE SEGURIDAD: ${body.type} en ${body.city}`,
      message: `Precaución: ${body.description?.substring(0, 100)}... Sector: ${body.address}. Riesgo: ${body.riskLevel || 'Alto'}.`,
      type: 'Seguridad',
      targetArea: body.state,
    });

    return new Response(JSON.stringify(newDoc), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
