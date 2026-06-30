import { getAdminClient } from '../../../_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
  params: { id: string };
}) {
  const { request, env, params } = context;
  const supabase = getAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { id } = params;

  const { data: doc, error: findError } = await supabase.from('posts').select('*').eq('id', id).single();
  if (findError || !doc) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'GET') {
    const comments = ((doc.comments || []) as { createdAt: string }[]).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return new Response(JSON.stringify(comments), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    if (!body.author || !body.text) {
      return new Response(JSON.stringify({ error: 'Nombre y comentario son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const comment = {
      id: crypto.randomUUID(),
      author: body.author,
      contact: body.contact || '',
      text: body.text,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...(doc.comments || []), comment];

    const { error: updateError } = await supabase.from('posts').update({ comments: updatedComments }).eq('id', id);
    if (updateError) throw updateError;

    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
