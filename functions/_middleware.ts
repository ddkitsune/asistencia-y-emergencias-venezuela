import { verifyToken } from './_db';

export async function onRequest(context: {
  request: Request;
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; SUPABASE_ANON_KEY: string };
  next: () => Promise<Response>;
  data?: Record<string, unknown>;
}) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (url.pathname === '/api/health') {
    return next();
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Token de autenticación requerido' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.slice(7);
  try {
    const user = await verifyToken(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);
    context.data = { user };
    return next();
  } catch {
    return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
