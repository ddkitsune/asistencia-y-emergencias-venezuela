# Deployment a Cloudflare — Asistencia y Emergencias Venezuela

## Resumen

Plataforma "Asistencia y Emergencias Venezuela" desplegada en Cloudflare Pages + Functions, con Supabase como backend (Auth + PostgreSQL).

## Arquitectura

```
Browser (React SPA)
    → Cloudflare CDN (assets estáticos)
    → Cloudflare Pages Functions (API REST)
        → Supabase Client (service_role)
            → PostgreSQL (datos)
```

Decisiones clave:
- **Cloudflare Pages + Functions** como API REST. Cada endpoint es un archivo independiente bajo `functions/api/`.
- **Supabase (service_role key)** en las Functions para acceso administrador a PostgreSQL.
- **Supabase Auth (Google OAuth)** para autenticación. Token JWT verificado en cada Function.
- **Frontend:** AuthContext con Supabase JS client. Login con Google OAuth, token adjuntado como Bearer.

## Estructura de archivos

```
functions/
  _middleware.ts          # Verifica token JWT de Supabase, permite paso
  _types.ts               # Tipos compartidos + tipo Database para Supabase
  api/
    emergencies.ts        # GET, POST
    emergencies/[id].ts   # PATCH
    volunteers.ts         # GET, POST
    volunteers/[id].ts    # PATCH
    incidents.ts          # GET, POST
    incidents/[id].ts     # PATCH / POST (verify)
    resources.ts          # GET, POST
    resources/[id].ts     # PATCH
    notifications.ts      # GET, POST
    notifications/mark-read.ts  # POST
    posts.ts              # GET, POST
    posts/[id].ts         # PATCH
    posts/[id]/like.ts    # POST
    posts/[id]/verify.ts  # POST
    posts/[id]/comments.ts # GET, POST
  _db.ts                  # Inicialización Supabase Admin client + verifyToken helper

src/
  contexts/
    AuthContext.tsx        # Supabase Auth + Google OAuth
  hooks/
    useApi.ts             # Fetch con token Bearer
  components/
    LoginButton.tsx        # Botón login/logout con Google
  App.tsx                  # Provider de AuthContext
  ...

supabase/
  migration.sql           # SQL para crear todas las tablas en Supabase

wrangler.toml
vite.config.ts
```

## Pages Functions API

Cada Function recibe un `context` con `request`, `env` y `params`. El middleware de autenticación se ejecuta antes de cada handler.

### Endpoints

| Método | Ruta | Función |
|--------|------|---------|
| GET | /api/health | Health check |
| GET | /api/emergencies | Listar emergencias |
| POST | /api/emergencies | Crear emergencia |
| PATCH | /api/emergencies/:id | Actualizar estado/recursos |
| GET | /api/volunteers | Listar voluntarios |
| POST | /api/volunteers | Registrar voluntario |
| PATCH | /api/volunteers/:id | Actualizar estado |
| GET | /api/incidents | Listar incidentes |
| POST | /api/incidents | Reportar incidente |
| PATCH | /api/incidents/:id | Actualizar / verificar |
| GET | /api/resources | Listar recursos |
| POST | /api/resources | Crear recurso |
| PATCH | /api/resources/:id | Actualizar cantidad |
| GET | /api/notifications | Listar notificaciones |
| POST | /api/notifications | Crear alerta |
| POST | /api/notifications/mark-read | Marcar todo leído |
| GET | /api/posts | Listar posts |
| POST | /api/posts | Crear post |
| PATCH | /api/posts/:id | Actualizar post |
| POST | /api/posts/:id/like | Dar like / quitar like |
| POST | /api/posts/:id/verify | Verificar post |
| GET | /api/posts/:id/comments | Obtener comentarios |
| POST | /api/posts/:id/comments | Agregar comentario |

### Diferencias con Firestore

- Firestore `collection('x').doc(id)` → Supabase `.from('x').select('*').eq('id', id).single()`
- Firestore `ref.add({...})` → Supabase `.insert({...}).select().single()`
- Firestore `docRef.update({...})` → Supabase `.update({...}).eq('id', id)`
- Firestore `orderBy('field', 'desc')` → Supabase `.order('field', { ascending: false })`
- Arrays (likedBy, comments) se almacenan como JSONB en PostgreSQL

## Autenticación

### Frontend (AuthContext.tsx)
- Inicializar Supabase client con `createClient(url, anonKey)`
- Login con `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Obtener token con `supabase.auth.getSession()` → `session.access_token`
- Adjuntar header `Authorization: Bearer <access_token>` en cada fetch a `/api/*`

### Backend (_middleware.ts)
- Extraer token del header `Authorization`
- Verificar con `supabase.auth.getUser(token)`
- Responder 401 si token inválido o ausente

## Base de Datos

### Supabase (PostgreSQL)

Seis tablas:

| Tabla | Descripción |
|-------|-------------|
| emergencies | Emergencias humanitarias reportadas |
| volunteers | Voluntarios registrados |
| incidents | Incidentes de seguridad |
| resources | Suministros e inventario |
| notifications | Alertas push |
| posts | Muro social solidario |

### RLS (Row Level Security)

- Lectura pública para todas las tablas
- Escritura requiere autenticación (`auth.role() = 'authenticated'`)
- Las operaciones del backend usan `service_role` key (bypass RLS)

## Configuración Cloudflare

### wrangler.toml
```toml
name = "asistencia-venezuela"
pages_build_output_dir = "dist"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]
```

### Secrets requeridos (Cloudflare Dashboard)
| Secret | Descripción |
|--------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin access) |
| `SUPABASE_ANON_KEY` | Anon/public key (para verifyToken) |
| `GEMINI_API_KEY` | API key de Gemini |

### Frontend env vars
| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key (pública) |

## Orden de implementación

1. Crear proyecto Supabase y ejecutar `supabase/migration.sql`
2. Configurar Google OAuth en Supabase Auth
3. Configurar secrets en Cloudflare Dashboard
4. Probar localmente con `wrangler dev`
5. Hacer commit y deploy a Cloudflare
6. Verificar funcionamiento en producción

## Notas de despliegue

- `npm run build` genera `dist/` con el frontend estático
- `wrangler pages deploy` sube todo a Cloudflare
- Pages Functions se depliegan automáticamente con el directorio `functions/`
- Costo: plan gratuito de Cloudflare + plan gratis de Supabase
