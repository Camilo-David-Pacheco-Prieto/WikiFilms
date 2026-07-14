# WikiFilms — Manual de Arquitectura y Desarrollo

## Visión del Proyecto

WikiFilms es una enciclopedia de entretenimiento web. Consume la API de **TMDB (The Movie Database)** para películas/series y **IGDB (Internet Game Database) via Twitch** para videojuegos. Migración desde WikiPeliculasAPI (escritorio Java Swing) a una aplicación web moderna desplegada en Vercel.

**Objetivo final:** App responsive con catálogo unificado de películas, series y videojuegos, accesible desde cualquier dispositivo, con autenticación de usuarios, panel admin y contenido siempre actualizado.

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16.2.10 |
| Lenguaje | TypeScript | 5.x strict |
| Estilos | Tailwind CSS | 4.3.2 |
| UI Kit | shadcn/ui (Base Nova) | latest |
| ORM | Prisma | 7.8.0 |
| DB | Vercel Postgres (Neon) | via @prisma/adapter-neon |
| Auth | NextAuth | 5.0.0-beta.31 |
| Paquetería | pnpm | 11.8.0 |
| Fuentes | Oswald (display) + Inter (body) | Google Fonts |
| Iconos | lucide-react | - |
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
│   ├── globals.css                      # Variables CSS + estilos base
│   ├── layout.tsx                       # Layout raíz + fuentes + Navbar
│   └── page.tsx                         # Home (populares, sin shuffle)
├── components/
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
│   ├── igdb.ts              # Servicio IGDB con auth Twitch OAuth2 + token cache + endpoints
│   ├── prisma.ts            # Cliente Prisma singleton con adapter Neon
│   ├── tmdb.ts              # Servicio TMDB con caching + localeToTMDBlang("es")="es-MX" + region CO
│   └── utils.ts             # Utilidades (shadcn)
├── types/
│   ├── igdb.ts              # Tipos IGDBGameResult, IGDBGameDetail, GameResult, constantes de imagen
│   └── tmdb.ts              # Tipos TMDB (incluye iso_639_1 en TMDBVideoResponse, MediaType="game")
└── proxy.ts                 # Reemplaza middleware.ts: rate limit + auth rutas admin/games + jwtDecrypt via getToken()
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
  - `/api/auth/*` — rate limiting (40 req/min por IP)
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
- TMDB cacheado 1 hora (`next: { revalidate: 3600 }`)
- IGDB cacheado 1 hora (`next: { revalidate: 3600 }`)
- next/image para pósters TMDB; `<img>` nativo para IGDB (evita 404 de Vercel)
- Navbar con sesión usando `auth()` de NextAuth

---

## Comandos Esenciales

```bash
pnpm dev           # Iniciar servidor desarrollo (localhost:3000)
pnpm build         # Compilar producción
pnpm start         # Iniciar servidor producción
pnpm lint          # ESLint
pnpm prisma generate   # Generar cliente Prisma
pnpm prisma migrate dev  # Migrar DB local
pnpm prisma migrate deploy # Migrar DB producción (Vercel)
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

## Próximas Funcionalidades Planificadas

### Fase 3 — Polishing & Features
- [ ] PWA (manifest.json + service worker)
- [ ] Modo oscuro/claro toggle
- [ ] Paginación en resultados de búsqueda
- [ ] Filtro por género en home
- [ ] Skeletons de carga para mejorar UX
- [ ] Página 404 personalizada
- [ ] Tests unitarios (Vitest) + E2E (Playwright)
- [ ] Scroll suave entre secciones en detalle
- [x] Avatar/subir foto de perfil
- [ ] Ranking de usuarios por actividad

### Fase 4 — Escalabilidad
- [ ] Rate limiting server-side para proteger TMDB
- [ ] Redis cache para popular/trending
- [ ] Webhooks TMDB para contenido nuevo
- [ ] Panel admin con analytics (graficos, metricas)
- [ ] CI/CD con GitHub Actions

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