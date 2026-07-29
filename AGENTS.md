# WikiFilms — Manual de Arquitectura y Desarrollo

## Visión del Proyecto

WikiFilms es una enciclopedia de entretenimiento web. Consume la API de **TMDB (The Movie Database)** para películas/series y **IGDB (Internet Game Database) via Twitch** para videojuegos. Migración desde WikiPeliculasAPI (escritorio Java Swing) a una aplicación web moderna desplegada en Vercel.

**Objetivo final:** App responsive con catálogo unificado de películas, series y videojuegos, accesible desde cualquier dispositivo, con autenticación de usuarios, panel admin y contenido siempre actualizado.

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16.2.12 |
| Lenguaje | TypeScript | 5.x strict |
| Estilos | Tailwind CSS | 4.3.3 |
| UI Kit | shadcn/ui (Base Nova) | 4.15.0 |
| Rate Limiting | Upstash Redis + @upstash/ratelimit | 2.0.8 |
| ORM | Prisma | 7.9.0 |
| DB | Vercel Postgres (Neon) | via @prisma/adapter-neon |
| Auth | NextAuth | 5.0.0-beta.32 |
| Paquetería | pnpm | 11.8.0 |
| Fuentes | Oswald (display) + Inter (body) | Google Fonts |
| Iconos | lucide-react | 1.27.0 |
| IGDB / Twitch | API de videojuegos | v4 |

---

## Paleta de Colores (CSS Variables)

```css
/* Variables globales — cambiar desde un solo lugar: src/app/globals.css */

--color-base: #09090b;              /* Fondo base (zinc-950) */
--color-surface: #18181b;            /* Superficies, cards (zinc-900) */
--color-surface-glass: #18181b/60%;  /* Glassmorphism con backdrop-blur-xl */
--color-text-primary: #ffffff;       /* Blanco puro */
--color-text-secondary: #a1a1aa;    /* Zinc-400 para etiquetas */
--color-border-subtle: #27272a;       /* zinc-800 para bordes, divisores */
--color-accent-brand: #e11d48;      /* rose-600 — VARIABLE GLOBAL (cambiar aquí) */
--color-accent-hover: #be123c;       /* rose-700 */
--color-accent-soft: #881337;        /* rose-900 */
```

**Filosofía visual:** *Cinematic Dark Mode + Glassmorphism* — la interfaz "desaparece" para que el póster sea el rey. Inspirado en Marvel Comics web.

### Cambiar el color de acento
Editar `--color-accent-brand` en `src/app/globals.css`. Eso actualiza todos los botones, badges, links y bordes.

---

## Tipografía

| Uso | Fuente | CSS Variable | Peso |
|-----|--------|---------------|-------|
| Títulos (display) | Oswald | `--font-display` | `font-bold`, `font-black`, mayúsculas |
| Cuerpo / UI | Inter | `--font-body` | `font-normal`, `font-medium` |
| Sinopsis | Inter | `--font-body` | `leading-relaxed` |

---

## Estructura del Proyecto

```
├── prisma/
│   └── schema.prisma                    # Esquema DB: Favorite/WatchlistItem/Review con @@unique([userId, contentId, type])
├── src/
├── app/
│   ├── (auth)/                          # Grupo de rutas de autenticación
│   │   ├── login/page.tsx               # Login page
│   │   └── register/page.tsx            # Register page
│   ├── admin/
│   │   ├── actions.ts                   # getAdminStats() con Redis cache
│   │   ├── layout.tsx                   # Tabs navegación Statistics | Users
│   │   ├── page.tsx                     # Dashboard analytics (solo ADMIN)
│   │   └── users/
│   │       ├── actions.ts               # Server Actions CRUD
│   │       └── page.tsx                 # Panel admin (solo ADMIN)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   ├── register/route.ts        # API de registro
│   │   │   └── update/route.ts          # Actualizar perfil
│   │   ├── favorites/
│   │   │   ├── route.ts                 # CRUD favoritos (userId_contentId_type)
│   │   │   └── check/route.ts           # Verificar favorito por contentId+type
│   │   ├── notifications/
│   │   │   ├── route.ts                 # Listar notificaciones
│   │   │   ├── read-all/route.ts        # Marcar todas leidas
│   │   │   └── stream/route.ts          # SSE en tiempo real
│   │   ├── reviews/
│   │   │   ├── route.ts                 # CRUD resenas (con contentType)
│   │   │   ├── [id]/reactions/route.ts  # Like/dislike resena
│   │   │   └── [id]/comments/
│   │   │       ├── route.ts             # GET listar + POST crear
│   │   │       ├── [commentId]/route.ts # PATCH editar, DELETE eliminar
│   │   │       └── [commentId]/reactions/route.ts # Like/dislike comentario
│   │   ├── games/
│   │   │   ├── [id]/route.ts            # API detalle juego (IGDB)
│   │   │   ├── popular/route.ts         # API juegos populares
│   │   │   ├── search/route.ts          # API búsqueda juegos
│   │   │   └── upcoming/route.ts        # API próximos lanzamientos
│   │   ├── blob/route.ts                # Proxy blobs privados (get + auth)
│   │   ├── upload-avatar/route.ts       # Upload avatar a Vercel Blob (private)
│   │   └── watchlist/route.ts           # CRUD watchlist (userId_contentId_type)
│   ├── dashboard/page.tsx               # Perfil + favoritos con tabs Movies/Series | Games
│   ├── game/[id]/page.tsx               # Detalle juego (hero trailer + summary + storyline + screenshots + artworks + videos + fav + watchlist + reviews)
│   ├── games/page.tsx                   # Home juegos (hero slider + populares + próximos)
│   ├── movie/[id]/page.tsx              # Detalle película + SEO
│   ├── tv/[id]/page.tsx                 # Detalle serie + SEO
│   ├── search/
│   │   ├── page.tsx                     # Búsqueda server (TMDB + IGDB según type)
│   │   └── search-form.tsx              # Formulario client-side con filtro Movies/Series/Games
│   ├── settings/page.tsx                # Configuración usuario
│   ├── watchlist/page.tsx               # Watchlist personal con tabs Movies/Series | Games
│   ├── notifications/page.tsx           # Historial de notificaciones
│   ├── coming-soon/page.tsx             # Próximas funcionalidades
│   ├── genre/[slug]/page.tsx            # Página de género dedicada con tabs Movies/Series + paginación
│   ├── leaderboard/
│   │   ├── actions.ts                   # getLeaderboard() con Redis cache
│   │   └── page.tsx                     # Ranking top 50 usuarios
│   ├── globals.css                      # Variables CSS + estilos base
│   ├── layout.tsx                       # Layout raíz + fuentes + Navbar
│   └── page.tsx                         # Home (populares, sin shuffle)
├── components/
│   ├── admin/
│   │   └── stats-chart.tsx              # Graficos recharts (BarChart + PieChart)
│   ├── auth/
│   │   ├── login-form.tsx               # Form login
│   │   ├── register-form.tsx            # Form register
│   │   └── settings-form.tsx            # Avatar upload + editar perfil
│   ├── content/
│   │   ├── content-card.tsx             # Card grid: mobile badge top-right + titulo oculto, desktop slide-up
│   │   ├── content-grid.tsx             # Grid responsivo
│   │   ├── detail-hero.tsx              # Hero movies/series (backdrop + poster + info + trailer fondo)
│   │   ├── game-detail-hero.tsx         # Hero juegos (backdrop + trailer fondo + poster + rating + lang=en)
│   │   ├── hero-slider.tsx              # Slider hero con tendencias
│   │   ├── navbar.tsx                   # Navbar con sesión
│   │   ├── theme-toggle.tsx             # Toggle modo oscuro/claro (Sun/Moon)
│   │   ├── review-section.tsx           # Reseñas con contentType (movie|tv|game)
│   │   ├── favorite-button.tsx          # Star icon, type movie|tv|game
│   │   ├── watchlist-button.tsx         # Labels condicionales: game→Jugado, movie/tv→Visto
│   │   ├── search-bar.tsx               # Navbar search, detecta sección juegos
│   │   ├── notification-bell.tsx        # Campana de notificaciones SSE
│   │   ├── skeleton-card.tsx            # Skeleton card loading
│   │   ├── skeleton-grid.tsx            # Skeleton grid loading
│   │   └── skeleton-hero.tsx            # Skeleton hero loading
│   └── ui/
│       ├── badge.tsx (shadcn)
│       ├── button.tsx (shadcn)
│       └── card.tsx (shadcn)
├── lib/
│   ├── auth.ts              # NextAuth config + handlers
│   ├── cache.ts             # Redis cache genérico (cachedFetch con TTL, fallback silencioso)
│   ├── igdb.ts              # Servicio IGDB con auth Twitch OAuth2 + Redis cache + endpoints
│   ├── prisma.ts            # Cliente Prisma singleton con adapter Neon
│   ├── rate-limit.ts        # 3 tiers de rate limiting con Upstash Redis (strict/write/read)
│   ├── tmdb.ts              # Servicio TMDB con Redis cache + localeToTMDBlang("es")="es-MX" + region CO
│   └── utils.ts             # Utilidades (shadcn)
├── types/
│   ├── igdb.ts              # Tipos IGDBGameResult, IGDBGameDetail, GameResult, constantes de imagen
│   └── tmdb.ts              # Tipos TMDB (incluye iso_639_1 en TMDBVideoResponse, MediaType="game")
├── proxy.ts                 # Reemplaza middleware.ts: rate limit + auth rutas admin/games + jwtDecrypt via getToken()
└── .github/
    └── workflows/
        └── ci.yml           # GitHub Actions: lint → prisma generate → next build (Node 20 LTS, pnpm 11)
```

---

## Principios de Código

### SOLID aplicados

| Principio | Implementación |
|-----------|---------------|
| **S** - Single Responsibility | Cada componente hace una cosa. `tmdb.ts` solo habla con TMDB, `prisma.ts` solo con la DB. |
| **O** - Open/Closed | `ContentCard` se extiende vía props. `ContentGrid` es genérico. |
| **L** - Liskov Substitution | `ContentResult` y `ContentDetail` siguen el mismo contrato. |
| **I** - Interface Segregation | Componentes reciben solo las props que necesitan. |
| **D** - Dependency Inversion | Servicio TMDB inyectado vía fetch. Prisma se instancia como singleton. |

### Clean Code
- **Nombres significativos**: `popularMovies`, `searchResults`, `userSession`
- **Funciones pequeñas**: máximo 20-25 líneas
- **TypeScript estricto**: sin `any` en producción (solo donde es inevitable)
- **Validación con Zod**: toda entrada de usuario se valida
- **Constantes con nombre**: GENRE_MAP, BASE_URL, IMG_BASE_URL

### Seguridad
- TMDB API key **nunca** llega al cliente (solo en servidor)
- Twitch Client ID y Secret **nunca** llegan al cliente (solo en servidor)
- Passwords hasheados con bcrypt (12 rounds)
- `proxy.ts` protege rutas:
  - `/admin/*` — requiere sesión + rol ADMIN
  - `/games/*`, `/game/*` — requiere sesión (cualquier rol)
  - `/api/*` — rate limiting con Upstash Redis (persiste entre instancias serverless)
    - `/api/auth/register`, `/api/auth/update` → **5 req / 15 min** (strict)
    - POST/PATCH/DELETE en otras rutas → **30 req / 1 min** (write)
    - GET en otras rutas → **100 req / 1 min** (read)
    - Bypass: `/api/auth/session`, `/api/auth/csrf`, `/api/auth/callback/*`, `/api/notifications/stream`
- **Auth proxy**: usa `getToken` de `next-auth/jwt` (HKDF key derivation) en lugar de `jose.jwtDecrypt` manual
- Server Actions verifican rol ADMIN antes de operaciones
- Variables de entorno en `.env.local` y Vercel

### TMDB LATAM
- `localeToTMDBlang("es")` → `"es-MX"` (español latino, no español de España)
- `localeToTMDBRegion("es")` → `"CO"` (Colombia como región base)
- Trailers priorizan `iso_639_1 === "es"` sobre inglés/otros
- Proveedores de streaming filtrados por región (CO, MX, AR)

### IGDB — Videojuegos
- **Fuente**: IGDB API v4 via Twitch OAuth2 `client_credentials`
- **Auth**: Token en memoria (`cachedToken` + `tokenExpiresAt`), refresco automático
- **Servicio**: `src/lib/igdb.ts` — `fetchFromIGDB<T>()`, token cache, mapeo a `GameResult`
- **Tipos**: `src/types/igdb.ts` define `IGDBGameResult`, `IGDBGameDetail`, `GameResult`
- **GameResult** es estructuralmente compatible con `ContentResult` (`type: "game"`) para reutilizar `ContentCard`, `ContentGrid` y `HeroSlider`
- **Imágenes**: `https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.jpg`
  - `IGDB_COVER_SIZE = "cover_big"` — 264x374
  - `IGDB_SCREENSHOT_SIZE = "screenshot_big"` — 889x500
  - **Importante**: el prefijo es `t_SIZE` con underscore, NO `t/SIZE`
- **Carga de imágenes**: `<img>` nativo en vez de `next/image` (bypass a optimización de Vercel)
  - `onError` con fallback visual para cuando una imagen falla
  - `ContentCard`, `HeroSlider`, `game-detail-hero` y `game/[id]` todos usan `<img>` nativo
- **RemotePatterns** en `next.config.ts`: `images.igdb.com`
- **Endpoints IGDB usados**:
  - `searchGames(query, limit)` — búsqueda
  - `getPopularGames(limit, offset)` — más votados
  - `getUpcomingGames(limit)` — próximos lanzamientos
  - `getTrendingGames(limit)` — tendencias (altos votos + screenshots)
  - `getGameById(id)` — detalle completo (storyline, companies, artworks, videos)
- **Proxy.ts** protege `/games/*` y `/game/*` con sesión (usa `getToken` de `next-auth/jwt`)
- **i18n**: 11+ keys (`games.popular`, `games.upcoming`, `game.summary`, `game.storyline`, `game.screenshots`, `game.artworks`, `game.videos`, `game.platforms`, `game.developedBy`, `game.publishedBy`, `nav.games`)
- **Navbar**: link "Juegos" visible solo para usuarios autenticados
- **`MediaType`** en `types/tmdb.ts` incluye `"game"`
- **Trailer de fondo**: `game-detail-hero.tsx` reproduce el primer video de YouTube autoplay+muted+loop como fondo del hero (oculto en mobile), con overlay `bg-black/50` + mismo gradiente bottom-to-top que movies
- **Traducción al español**: `lang="en"` en título, plataformas, géneros, compañías, summary, storyline y videos — el navegador Chrome/Edge detecta el inglés y ofrece traducir automáticamente. IGDB no provee summaries localizados. No se usa DeepL ni APIs externas.
- **`game_localizations`**: endpoint de IGDB existe pero solo expone `name` y `region` (no `summary` ni `storyline`)

### Search — Búsqueda unificada
- **Navbar** (`search-bar.tsx`): detecta ruta actual via `usePathname()`. Si está en `/games` o `/game/*`, pasa `type=game` al search y cambia placeholder a "Buscar juegos..."
- **Search page** (`search/page.tsx`): cuando `type=game`, llama `searchGames()` de IGDB en vez de TMDB. Misma grid `ContentGrid` porque `GameResult` es compatible con `ContentResult`
- **Search form** (`search-form.tsx`): tres filtros: "Películas" | "Series" | "Juegos". Al activar "Juegos", la búsqueda va a IGDB
- **Sin paginación** para juegos (IGDB no expone total de páginas fácilmente)

### Favorites + Watchlist — Type discriminator
- **Backend unificado**: una sola tabla `Favorite`, `WatchlistItem` y `Review` para movies/tv/game
- **Unique constraint**: `@@unique([userId, contentId, type])` — permite que movie id=123 y game id=123 coexistan sin colisión
- **API routes**: todas usan `userId_contentId_type` como composite key
  - `favorites/check?contentId=X&type=Y`
  - `watchlist?contentId=X&type=Y` (GET, POST, DELETE)
  - `reviews?contentId=X&contentType=Y` (GET, POST)
- **Prisma migration**: `prisma db push --accept-data-loss` para aplicar cambios de unique constraints

### Favorites — Star icon
- `favorite-button.tsx`: usa `Star` de lucide-react en vez de `Heart`
- Colores: `fill-yellow-400` cuando activo, `text-yellow-400/50` cuando inactivo
- Borde: `border-yellow-400` en hover/activo

### Watchlist — Labels condicionales
- `watchlist-button.tsx`: si `type === "game"` usa labels "Jugado"/"Por jugar"/"Agregar a lista" con icono `Gamepad2`
- Si `type === "movie" | "tv"` usa labels "Visto"/"Por ver"/"Mi lista" con icono `Eye` (comportamiento original)
- `watchlist/page.tsx`: tabs "Películas/Series" | "Juegos". Tab juegos muestra headers "Jugados ({count})" / "Por jugar ({count})"
- `dashboard/page.tsx`: mismos tabs en favoritos
- Links a `/game/{id}` cuando `type === "game"`

### Mobile — ContentCard premium
- **Overlay sutil**: `from-black/40` (mitad de opacidad que desktop) para que se vea más la imagen
- **Rating badge**: `text-[10px]`, posicionado `top-1.5 right-1.5`, semitransparente (`bg-black/60`), siempre visible
- **Título**: oculto por defecto, aparece al hacer hover/tap via `group-hover:opacity-100` con `text-xs`
- **Desktop intacto**: overlay `from-black/80`, título + año + rating en bottom, slide-up animation en hover

### Game Detail — Features completas
- `game/[id]/page.tsx` incluye `FavoriteButton`, `WatchlistButton` y `ReviewSection` con `type="game"` / `contentType="game"`
- El `ReviewSection` se adapta automáticamente (mismo componente que movies/series)
- Botones de favoritos y watchlist en el detalle

### Notifications — Contenido referenciado
- **`contentTitle`** (`String?`) agregado al modelo Notification — almacena el título del juego/película/serie asociado
- Se envía desde `ReviewSection` (via `contentTitle` prop) → API routes → `prisma.notification.create`
- Se muestra en `notification-bell.tsx` y `notifications/page.tsx` como "— {title}" tras el texto de acción
- **timeAgo i18n**: corregido en ambas vistas (bell client-side + page server-side) para usar dictionary keys en vez de español hardcodeado
- Fuentes de creación: `reactions/route.ts`, `comments/route.ts`, `comments/[commentId]/reactions/route.ts`

### Avatar Upload — Vercel Blob privado
- **Storage**: Vercel Blob Store configurado como **privado** (no público)
- **Upload**: `api/upload-avatar/route.ts` — valida sesión, tipo imagen, tamaño ≤2MB. Convierte `File` a `Buffer`, sube con `put(pathname, buffer, { access: "private", contentType })`. Guarda `blob.pathname` en `User.avatarUrl`
- **Proxy**: `api/blob/route.ts` — endpoint GET que recibe `?pathname=...`, valida sesión, ejecuta `get(pathname, { access: "private" })`, devuelve stream con `Cache-Control: private, no-cache`
- **Session flow**: `lib/auth.ts` JWT callback transforma pathname a `/api/blob?pathname=...` en sign-in. Session callback re-lee `avatarUrl` de la DB en cada request para mantener frescura
- **Upload client**: `settings-form.tsx` — avatar `size-24` clickeable con overlay hover (cámara) + spinner (uploading). Usa `useSession().update()` después del upload para forzar refresh del JWT. Muestra error real de la API
- **Display**: `user-dropdown.tsx` — `<AvatarImage src={avatarUrl} />` recibe la proxy URL desde la session. Si es null, muestra `<AvatarFallback>` con iniciales
- **Env var requerida**: `BLOB_READ_WRITE_TOKEN` en Vercel Dashboard → Environment Variables

### Performance
- **Redis cache** (`src/lib/cache.ts`): respuestas TMDB/IGDB cacheadas 1 hora en Upstash Redis, con `cachedFetch<T>()`
- **Doble capa**: Redis cache + `next: { revalidate: 3600 }` en fetch — Redis es el hit primario, Next.js data cache es fallback
- next/image para pósters TMDB; `<img>` nativo para IGDB (evita 404 de Vercel)
- Navbar con sesión usando `auth()` de NextAuth

### Theme Toggle — Modo oscuro/claro
- **Provider**: `next-themes` (0.4.6) con `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`
- **Toggle**: `theme-toggle.tsx` — botón `variant="ghost" size="icon"` en navbar junto a `LanguageSwitcher`
- **CSS**: bloque `.light` en `globals.css` overridea todas las variables CSS (`--color-*` de `@theme inline` + `--background/foreground` de shadcn)
- **Hydration**: componente monta con placeholder `size-9` para evitar flash, luego renderiza `Sun`/`Moon` de lucide-react
- **Colores light**: fondo `#fafafa`, superficies `#ffffff`, texto `#18181b`, borders `#e4e4e7`, accent brand `#e11d48` se mantiene

---

### Redis Cache — TMDB + IGDB

- **Propósito**: Cachear respuestas de TMDB e IGDB en Redis para reducir llamadas a APIs externas, mejorar velocidad y disminuir costos en Vercel
- **Archivo**: `src/lib/cache.ts` — función genérica `cachedFetch<T>(key, fetcher, ttl?)`
- **Flujo**: check Redis → si hit, devuelve; si miss, ejecuta fetcher → almacena en Redis → devuelve
- **TTL**: 3600s (1 hora) — igual que el `revalidate` anterior
- **Fallback silencioso**: si Redis no está disponible, continúa con fetch directo sin lanzar error
- **Keys**: `cache:tmdb:<url>` para TMDB, `cache:igdb:<endpoint>:<body>` para IGDB
- **Integración**: `src/lib/tmdb.ts` y `src/lib/igdb.ts` envuelven su fetch interno con `cachedFetch`

### Rate Limiting — Upstash Redis

- **Propósito**: Reemplazar rate limiting in-memory (no persistía entre instancias serverless) por un enfoque distribuido con Redis
- **Servicio**: Upstash Redis (HTTP/REST, ideal para Edge/Serverless)
- **Paquetes**: `@upstash/redis` (1.38.0) + `@upstash/ratelimit` (2.0.8)
- **Archivo**: `src/lib/rate-limit.ts` — 3 rate limiters exportados:

| Limiter | Límite | Rutas |
|---------|--------|-------|
| `strictRateLimit` | 5 req / 15 min por IP | `/api/auth/register`, `/api/auth/update` |
| `writeRateLimit` | 30 req / 1 min por IP | POST/PATCH/DELETE en favorites, watchlist, reviews, comments, reactions, blob, notifications |
| `readRateLimit` | 100 req / 1 min por IP | GET en favorites, check, watchlist, reviews, comments, games/*, notifications |

- **Middleware**: `src/proxy.ts` expandió su `matcher` de `/api/auth/:path*` a `/api/:path*` para cubrir todas las API routes
- **Bypass**: `/api/auth/session`, `/api/auth/csrf`, `/api/auth/callback/*`, `/api/notifications/stream` (rutas internas o de conexión persistente)
- **Conexión**: `Redis.fromEnv()` lee `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` de env vars
- **Analytics**: Habilitados (`analytics: true`) — visibles en dashboard de Upstash
- **Env vars requeridas en Vercel**: Production + Preview (Development usa `.env.local`)\

### Admin Dashboard — Analytics

- **Propósito**: Panel de administración con métricas del sitio en `/admin` (accesible solo para usuarios ADMIN)
- **Layout**: `src/app/admin/layout.tsx` — sticky tabs `Statistics | Users` debajo del navbar principal
- **Dashboard**: `src/app/admin/page.tsx` — cards numéricas (total usuarios, nuevos 30d, reseñas, favoritos) + tablas de contenido popular y usuarios activos
- **Gráficos**: `src/components/admin/stats-chart.tsx` — client component con recharts:
  - BarChart: reseñas por mes (últimos 12 meses)
  - PieChart: distribución de contenido por tipo (movie/tv/game)
- **Caché**: `admin:stats` en Redis con TTL 5 min via `cachedFetch`
- **Queries**: 8 queries Prisma en paralelo (`Promise.all`): counts, `groupBy` (favoritos, reviews, contentType), `aggregate` (avg rating). El server component llama `getAdminStats()` directamente sin API route intermedia
- **Navbar**: link "Admin" visible solo para role ADMIN, junto a los otros links de navegación
- **Paquete**: `recharts` (10.3.1, ~55KB gzipped) — solo se carga lazy en `/admin`
- **No requiere migración Prisma** — todo usa modelos existentes

### Leaderboard / Ranking

- **Propósito**: Página `/leaderboard` con top 50 usuarios más activos de la comunidad, visible para usuarios logueados
- **Scoring** (ponderado):
  - Reseña escrita: 10 pts
  - Favorito agregado: 5 pts
  - Comentario en reseña: 3 pts
  - Reacción recibida en reseña (like): 2 pts
  - Reacción recibida en comentario: 1 pt
- **Cache**: `leaderboard` en Redis con TTL 5 min via `cachedFetch`
- **Queries**: 5 queries Prisma en paralelo — `groupBy` en Review/Favorite/ReviewComment + `findMany` completo en ReviewReaction/CommentReaction (mapeo en JS para calcular reacciones recibidas por usuario)
- **UI**: Ranking numerado (#1-#50), avatar, nombre, username, stats abreviadas (r/f/c), score en pts, hover highlight
- **Navbar**: link "Ranking" visible para usuarios logueados, junto a Coming Soon y Admin
- **No requiere migración Prisma** — todo usa modelos existentes

```bash
pnpm dev           # Iniciar servidor desarrollo (localhost:3000)
pnpm build         # Compilar producción (prisma generate + next build)
pnpm start         # Iniciar servidor producción
pnpm lint          # ESLint
pnpm db:deploy     # Ejecutar migraciones pendientes en DB
pnpm prisma generate   # Generar cliente Prisma
pnpm prisma migrate dev  # Migrar DB local
```

---

## Flujo de Despliegue en Vercel

### Prerrequisitos
1. Repositorio en GitHub/WikiPeliculas_Project
2. Cuenta en Vercel (vercel.com)
3. Cuenta en TMDB (api key ya configurada: `TMDB_API_KEY=2b4a72141...`)
4. App registrada en [Twitch Developer Console](https://dev.twitch.tv/console) (Client ID + Secret)

### Pasos

#### 1. Conectar repo a Vercel
- Ir a vercel.com > Add New Project
- Importar repositorio desde GitHub
- Framework preset: Next.js

#### 2. Crear base de datos (Vercel Postgres)
- En dashboard de Vercel: Storage > Create Database > Postgres
- Copiar `DATABASE_URL` (connection string)

#### 3. Configurar variables de entorno en Vercel
```
TMDB_API_KEY=2b4a72141ca6729ae43afd155ad04ef0
DATABASE_URL=<pegar desde Vercel Postgres>
AUTH_SECRET=<generar con: openssl rand -base64 32>
NEXTAUTH_URL=https://wiki-films-fawn.vercel.app
TWITCH_CLIENT_ID=<de Twitch Developer Console>
TWITCH_CLIENT_SECRET=<de Twitch Developer Console>
BLOB_READ_WRITE_TOKEN=<de Vercel Dashboard → Storage → Blob → Settings>
UPSTASH_REDIS_REST_URL=<de Upstash Console → Database → REST URL>
UPSTASH_REDIS_REST_TOKEN=<de Upstash Console → Database → Token>
```

#### 4. Migrar esquema
En la terminal local, después de conectar Vercel:
```bash
pnpm prisma migrate deploy
```

También se puede ejecutar en Vercel como build command:
```json
"build": "prisma migrate deploy && next build"
```

---

## CI/CD — GitHub Actions

**Workflow:** `.github/workflows/ci.yml` — automatiza lint, typecheck y build en cada push/PR a `main`.

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm prisma generate
      - run: pnpm next build
```

**Pipeline:** `install → lint → prisma generate → next build` (~2-3 min).

**Particularidades:**
- `prisma generate` no necesita DATABASE_URL (solo genera tipos del schema)
- `next build` compila todas las rutas como dinámicas (`ƒ`), sin renderizado estático — no requiere env vars
- `prisma migrate deploy` se ejecuta por separado (`pnpm db:deploy`) — no incluido en `pnpm build` para evitar timeouts de advisory lock en Neon
- Los env checks de `src/lib/igdb.ts` (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET) se movieron a runtime dentro de `getAccessToken()` para no fallar en CI
- Deploy automático a Vercel sigue manejándose por la integración GitHub de Vercel (no parte de este workflow)

---

## Roadmap — Prioridad de Trabajo

### 🏁 Completado
- [x] Avatar / subir foto de perfil (Vercel Blob privado + proxy)
- [x] Modo oscuro/claro toggle (next-themes, `.light` block en globals.css)
- [x] Paleta light refinada (colores ajustados, footer oscuro en light mode)
- [x] Text colors adaptables (text-white → text-text-primary en 10 componentes)
- [x] Paginación en resultados de búsqueda (movies/series; IGDB no expone paginación)
- [x] Filtro por género en home (GenreFilter + getByGenre)
- [x] Página 404 personalizada (not-found.tsx)
- [x] Skeletons de carga — home y games con Suspense (detail pages: server-side directo sin skeleton)
- [x] Rate limiting server-side con Upstash Redis (3 tiers: strict/write/read)

### 🔴 P1 — Rendimiento + Costos
- [x] **Redis cache para popular/trending** — `src/lib/cache.ts` + integración en TMDB/IGDB. Reduce costo de Vercel functions y protege cuotas de APIs externas.

### 🟠 P2 — Estabilidad (pendiente — al final)
- [ ] **Tests unitarios (Vitest) + E2E (Playwright)** — Sin tests, cada cambio nuevo puede romper funcionalidad existente.
  - Plan: F2.1 Setup tooling → F2.2 Unit tests lib/ → F2.3 Integration API → F2.4 Component tests → F2.5 E2E Playwright → F2.6 CI workflow
  - Mock Prisma para unit, componentes críticos solamente (FavoriteButton, WatchlistButton, ReviewSection, auth forms)
  - ~10h total estimado

### 🟡 P3 — UX
- [x] **Página de género dedicada `/genre/[slug]`** — Server component con tabs Movies/Series, pagination, i18n. GenreFilter links ahora apuntan a `/genre/{slug}`.
- [x] **Scroll suave entre secciones** — `scroll-behavior: smooth` en `globals.css`.
- [x] **Contraste modo claro** — 21 instancias de `bg-zinc-800`/`bg-zinc-700` reemplazadas por `bg-muted`/`bg-muted/80` en skeletons, dropdowns, paginación.

### 🟢 P4 — Automatización
- [x] **CI/CD (GitHub Actions)** — `.github/workflows/ci.yml`: `install → lint → prisma generate → next build`. Node 20 LTS + pnpm 11. Sin secrets requeridos.

### 🔵 P5 — Features adicionales (~10-12h total)

**Orden sugerido de implementación:**

- [x] **Admin analytics** (~2h) — Dashboard en `/admin` con 4 cards métricas, 2 gráficos recharts (reseñas/mes + distribución por tipo), top contenido y usuarios activos. Cache Redis TTL 5min. Link Admin en navbar para ADMIN role.
  - `src/app/admin/actions.ts` — `getAdminStats()` con Redis cache
  - `src/app/admin/layout.tsx` — tabs navegación Statistics | Users
  - `src/app/admin/page.tsx` — dashboard con stats + gráficos + tablas
  - `src/components/admin/stats-chart.tsx` — BarChart + PieChart client

- [x] **Leaderboard / Ranking** (~4h) — Página `/leaderboard` con top 50 usuarios por actividad. Scoring: reviews×10 + favoritos×5 + comentarios×3 + reacciones reseña×2 + reacciones comentario×1. Cache Redis TTL 5min.
  - `src/app/leaderboard/actions.ts` — `getLeaderboard()` agregaciones + cache
  - `src/app/leaderboard/page.tsx` — tabla con rank, avatar, stats, score
  - Link en navbar para usuarios logueados
  - i18n keys (es/en)

- [ ] **PWA** (~4h) — `public/manifest.json` con metadata PWA. `public/sw.js` cache-first para assets estáticos. Registro via client component. Sin paquetes externos.
  - Archivos: `public/manifest.json`, `public/sw.js`, `src/components/content/sw-register.tsx`
  - Solo funcional en producción (HTTPS requerido para service worker)

- [ ] **Webhooks TMDB** (~2h) — Ruta `/api/webhook/tmdb` como placeholder estructural. TMDB no ofrece webhooks nativos (solo endpoint `changes` para polling). La ruta valida token secreto e invalida cache Redis.
  - `src/app/api/webhook/tmdb/route.ts` — POST handler
  - `WEBHOOK_SECRET` en `.env.example`
  - Documentación de que es placeholder para integración futura

---

## Convenciones

### Commits
```
feat: nueva funcionalidad
fix: corrección de bug
refactor: cambio sin alterar comportamiento
docs: solo documentación
chore: tooling, dependencias, config
style: cambios de formato (no lógica)
```

### Nombrado
- Archivos: `kebab-case.ts` / `PascalCase.ts` (componentes)
- Funciones/Componentes: `PascalCase`
- Variables/Funciones: `camelCase`
- Constantes/Enums: `UPPER_CASE` / `PascalCase`
- Tipos/Interfaces: `PascalCase` con prefijo `I` opcional

### Estructura de imports
```typescript
// 1. React/Next
import {...} from "next";
// 2. Librerías externas
import {...} from "next-auth";
// 3. Componentes locales
import {...} from "@/components/...";
// 4. Utilidades locales
import {...} from "@/lib/...";
// 5. Tipos
import type {...} from "@/types/...";
// 6. CSS
import "./globals.css";
```