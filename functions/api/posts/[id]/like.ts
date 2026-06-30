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
  const { uid } = await context.request.json();

  const { data: doc, error: findError } = await supabase.from('posts').select('*').eq('id', id).single();
  if (findError || !doc) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const likedBy: string[] = (doc.likedBy as string[]) || [];
  const likesCount = doc.likesCount || 0;

  let newLikedBy: string[];
  let newLikesCount: number;

  if (likedBy.includes(uid)) {
    newLikedBy = likedBy.filter((u: string) => u !== uid);
    newLikesCount = Math.max(0, likesCount - 1);
  } else {
    newLikedBy = [...likedBy, uid];
    newLikesCount = likesCount + 1;
  }

  const { error: updateError } = await supabase.from('posts').update({
    likedBy: newLikedBy,
    likesCount: newLikesCount,
  }).eq('id', id);
  if (updateError) throw updateError;

  const { data: updated } = await supabase.from('posts').select('*').eq('id', id).single();
  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}
