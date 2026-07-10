# WikiFilms

**Tu enciclopedia cinematografica personal.** Explora peliculas y series con informacion detallada de TMDB, resenas de la comunidad, sistema de notificaciones y mas. Diseno oscuro cinematografico inspirado en Marvel Comics.

## Stack

| Componente | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 strict |
| Estilos | Tailwind CSS v4 + shadcn/ui (Nova) |
| BASE DE DATOS | Vercel Postgres (Neon) via Prisma 7 |
| Autenticacion | NextAuth v5 (Credentials + bcrypt) |
| Fuentes | Oswald (display) + Inter (body) |
| Iconos | lucide-react |
| Despliegue | Vercel |

## Empezar

`ash
pnpm install
pnpm dev
`

Abrir [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

Crear .env.local:

`env
TMDB_API_KEY=tu_api_key
DATABASE_URL=postgresql://...
AUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
`

## Comandos

| Comando | Descripcion |
|---------|------------|
| pnpm dev | Servidor desarrollo |
| pnpm build | Compilar produccion |
| pnpm start | Servidor produccion |
| pnpm lint | ESLint |
| pnpm prisma generate | Generar cliente Prisma |
| pnpm prisma migrate dev | Migrar DB local |
| pnpm prisma migrate deploy | Migrar DB produccion |

## Rutas

| Ruta | Descripcion | Auth |
|------|-------------|------|
| / | Home con populares | Publica |
| /movie/[id] | Detalle pelicula + resenas | Publica |
| /tv/[id] | Detalle serie + resenas | Publica |
| /search | Busqueda | Publica |
| /login | Iniciar sesion | Publica |
| /register | Registrarse | Publica |
| /dashboard | Mi perfil | Requiere sesion |
| /settings | Configuracion | Requiere sesion |
| /watchlist | Mi lista | Requiere sesion |
| /notifications | Historial de notificaciones | Requiere sesion |
| /admin/users | CRUD usuarios | Requiere ADMIN |
| /coming-soon | Proximas funcionalidades | Publica |

## Funcionalidades

- **TMDB API** — Catalogo completo de peliculas y series con posters, sinopsis, elenco y proveedores de streaming
- **Autenticacion** — Registro/login con username/password, bcrypt, sesiones via NextAuth
- **Resenas** — Calificacion 1-10, comentario opcional, CRUD completo
- **Reacciones** — Like/dislike con toggle on/off
- **Comentarios anidados** — Respuestas con hilos, profundidad ilimitada, colapso tras 3 niveles
- **Notificaciones** — Campana con badge, polling 30s, marcado como leidas, historial en /notifications
- **Watchlist** — Marcar peliculas como vistas o por ver
- **Favoritos** — Agregar/quitar favoritos
- **Panel Admin** — CRUD de usuarios (solo ADMIN)
- **Proveedores de streaming** — Por region (Colombia, Mexico, Argentina, etc.)

## Documentacion

Ver archivos en /docs/:

- docs/FEATURES.md — Funcionalidades detalladas con modelos, API endpoints y UI
- docs/ARCHITECTURE.md — Estructura del proyecto, patrones y convenciones

## Licencia

MIT
