import { getAdminClient } from '../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
}) {
  const { request, env } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  if (request.method === 'GET') {
    const { data, error } = await supabase.from('volunteers').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const required = ['name', 'contact', 'specialty', 'state', 'city'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Campo obligatorio: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    const { data: newDoc, error } = await supabase.from('volunteers').insert({
      ...body,
      status: 'Disponible',
    }).select().single();
    if (error) throw error;

    await supabase.from('notifications').insert({
      title: `🤝 NUEVO VOLUNTARIO: ${body.specialty}`,
      message: `${body.name} se ha unido para dar apoyo en ${body.city}, Estado ${body.state}.`,
      type: 'Coordinación',
      targetArea: body.state,
    });

    return new Response(JSON.stringify(newDoc), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
