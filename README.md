# WikiFilms

Enciclopedia de entretenimiento web. Catalogo unificado de **peliculas, series y videojuegos** con resenas de la comunidad, watchlist, favoritos, notificaciones en tiempo real, ranking de usuarios y panel admin. Diseno cinematografico oscuro con modo claro.

## Stack

| Componente | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 strict |
| Estilos | Tailwind CSS v4 + shadcn/ui (Nova) |
| Base de datos | Vercel Postgres (Neon) via Prisma 7 |
| Cache + Rate Limiting | Upstash Redis |
| Autenticacion | NextAuth v5 (Credentials + bcrypt) |
| Almacenamiento | Vercel Blob (avatares privados) |
| APIs externas | TMDB (peliculas/series) + IGDB/Twitch (videojuegos) |
| Graficos | recharts (panel admin) |
| Iconos | lucide-react |
| Fuentes | Oswald (display) + Inter (body) |
| Paqueteria | pnpm |
| CI/CD | GitHub Actions |
| Despliegue | Vercel |

## Empezar

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

Crear `.env.local`:

```env
TMDB_API_KEY=tu_api_key
DATABASE_URL=postgresql://...
AUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
TWITCH_CLIENT_ID=tu_client_id
TWITCH_CLIENT_SECRET=tu_client_secret
BLOB_READ_WRITE_TOKEN=tu_blob_token
UPSTASH_REDIS_REST_URL=tu_upstash_url
UPSTASH_REDIS_REST_TOKEN=tu_upstash_token
WEBHOOK_SECRET=opcional_placeholder
```

## Comandos

| Comando | Descripcion |
|---------|------------|
| `pnpm dev` | Servidor desarrollo |
| `pnpm build` | Compilar produccion (prisma generate + next build) |
| `pnpm start` | Servidor produccion |
| `pnpm lint` | ESLint |
| `pnpm db:deploy` | Ejecutar migraciones pendientes en DB |
| `pnpm prisma generate` | Generar cliente Prisma |
| `pnpm prisma migrate dev` | Migrar DB local |

## Rutas

| Ruta | Descripcion | Auth |
|------|-------------|------|
| `/` | Home con populares | Publica |
| `/movie/[id]` | Detalle pelicula + resenas | Publica |
| `/tv/[id]` | Detalle serie + resenas | Publica |
| `/game/[id]` | Detalle videojuego + trailer + resenas | Requiere sesion |
| `/games` | Home juegos (populares + proximos) | Requiere sesion |
| `/search` | Busqueda peliculas/series/juegos | Publica |
| `/genre/[slug]` | Contenido por genero con tabs | Publica |
| `/login` | Iniciar sesion | Publica |
| `/register` | Registrarse | Publica |
| `/dashboard` | Mi perfil + favoritos | Requiere sesion |
| `/settings` | Configuracion + avatar + eliminar cuenta | Requiere sesion |
| `/watchlist` | Mi lista (vistos/jugados + pendientes) | Requiere sesion |
| `/leaderboard` | Ranking top 50 usuarios | Requiere sesion |
| `/user/[id]` | Perfil publico de usuario | Requiere sesion |
| `/notifications` | Historial de notificaciones | Requiere sesion |
| `/admin` | Dashboard analytics | Requiere ADMIN |
| `/admin/users` | CRUD usuarios | Requiere ADMIN |
| `/coming-soon` | Proximas funcionalidades | Publica |

## Funcionalidades

- **Peliculas y Series** — Catalogo completo TMDB con posters, sinopsis, elenco, trailers, proveedores streaming (Colombia, Mexico, Argentina, etc.)
- **Videojuegos** — Catalogo IGDB con trailers YouTube, capturas, artworks, plataformas, companias. Contenido en ingles con traduccion automatica del navegador
- **Hero Slider** — Tendencias con auto-rotacion, overlay multi-stop, responsive mobile/desktop
- **Content Cards** — Posters en grid con overlay, rating y titulo al hover
- **Autenticacion** — Registro/login con username/password, bcrypt, sesiones via NextAuth
- **Resenas** — Calificacion 1-10, comentario, CRUD completo con sort (nuevos/antiguos/populares)
- **Reacciones** — Like/dislike con toggle en resenas y comentarios
- **Comentarios anidados** — Respuestas con hilos, colapso tras 3 niveles, edicion, eliminacion, reacciones
- **Notificaciones** — Campana con badge, SSE en tiempo real, historial en /notifications
- **Watchlist** — Marcar vistas/por ver (peliculas/series) y jugados/por jugar (juegos)
- **Favoritos** — Agregar/quitar favoritos con estrella
- **Ranking de usuarios** — Top 50 por actividad (resenas, favoritos, comentarios, reacciones recibidas)
- **Perfiles de usuario** — Avatar, stats, ultimas resenas, link a configuracion si es propio
- **Avatar** — Subida de foto via Vercel Blob privado con proxy autenticado
- **Modo oscuro/claro** — Toggle con next-themes, paleta CSS adaptada
- **Panel Admin** — Dashboard con metricas (usuarios, resenas, favoritos), graficos recharts, CRUD de usuarios
- **PWA** — Manifest + service worker cache-first para instalacion como app
- **Rate Limiting** — Upstash Redis (3 tiers: strict/write/read) via middleware
- **Cache** — Redis cache para TMDB e IGDB con TTL 1h, fallback silencioso
- **Paginacion** — Resultados de busqueda y contenido por genero
- **i18n** — Espanol e ingles con LanguageProvider + detectServerLocale
- **Eliminar cuenta** — Confirmacion con password, cascade delete de todos los datos
- **CI/CD** — GitHub Actions: lint → prisma generate → next build en push/PR a main

## Licencia

MIT
