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
src/
├── app/
│   ├── (auth)/                     # Grupo de rutas de autenticación
│   │   ├── login/page.tsx           # Login page
│   │   └── register/page.tsx        # Register page
│   ├── admin/
│   │   └── users/
│   │       ├── actions.ts           # Server Actions CRUD
│   │       └── page.tsx            # Panel admin (solo ADMIN)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth handler
│   │   │   ├── register/route.ts          # API de registro
│   │   │   └── update/route.ts            # Actualizar perfil
│   │   ├── favorites/
│   │   │   ├── route.ts                  # CRUD favoritos
│   │   │   └── check/route.ts            # Verificar si es favorito
│   │   ├── notifications/
│   │   │   ├── route.ts                  # Listar notificaciones
│   │   │   ├── read-all/route.ts         # Marcar todas leidas
│   │   │   └── stream/route.ts           # SSE en tiempo real
│   │   ├── reviews/
│   │   │   ├── route.ts                  # CRUD resenas
│   │   │   ├── [id]/reactions/route.ts   # Like/dislike resena
│   │   │   └── [id]/comments/
│   │   │       ├── route.ts              # GET listar + POST crear
│   │   │       ├── [commentId]/route.ts  # PATCH editar, DELETE eliminar
│   │   │       └── [commentId]/reactions/route.ts # Like/dislike comentario
│   │   ├── games/
│   │   │   ├── [id]/route.ts             # API detalle juego (IGDB)
│   │   │   ├── popular/route.ts          # API juegos populares
│   │   │   ├── search/route.ts           # API búsqueda juegos
│   │   │   └── upcoming/route.ts         # API próximos lanzamientos
│   │   └── watchlist/route.ts            # CRUD watchlist
│   ├── dashboard/page.tsx               # Perfil de usuario
│   ├── game/[id]/page.tsx               # Detalle juego (hero + summary + storyline + screenshots + artworks + videos)
│   ├── games/page.tsx                   # Home juegos (hero slider + populares + próximos)
│   ├── movie/[id]/page.tsx              # Detalle película + SEO
│   ├── tv/[id]/page.tsx                   # Detalle serie + SEO
│   ├── search/
│   │   ├── page.tsx                      # Búsqueda server
│   │   └── search-form.tsx               # Formulario client-side
│   ├── settings/page.tsx                 # Configuración usuario
│   ├── watchlist/page.tsx                # Watchlist personal
│   ├── notifications/page.tsx            # Historial de notificaciones
│   ├── coming-soon/page.tsx              # Próximas funcionalidades
│   ├── globals.css                        # Variables CSS + estilos base
│   ├── layout.tsx                        # Layout raíz + fuentes + Navbar
│   └── page.tsx                           # Home (populares)
├── components/
│   ├── auth/
│   │   ├── login-form.tsx                # Form login
│   │   └── register-form.tsx             # Form register
│   ├── content/
│   │   ├── content-card.tsx               # Card para grid (hover/tap reveal)
│   │   ├── content-grid.tsx               # Grid responsivo
│   │   ├── detail-hero.tsx                # Hero Marvel-style (backdrop + poster + info)
│   │   ├── game-detail-hero.tsx           # Hero detalle juego (backdrop, poster, rating, tráiler modal)
│   │   ├── hero-slider.tsx                # Slider hero con tendencias, overlay multi-stop, responsive premium
│   │   ├── navbar.tsx                     # Navbar con sesión
│   │   ├── review-section.tsx             # Resenas + reacciones + comentarios anidados con edit/delete/reactions/sort
│   │   ├── notification-bell.tsx          # Campana de notificaciones con SSE cliente + pendingReads
│   │   ├── skeleton-card.tsx              # Skeleton para card loading
│   │   ├── skeleton-grid.tsx              # Skeleton para grid loading
│   │   └── skeleton-hero.tsx              # Skeleton para hero loading
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
  - `IGDB_SCREENSHOT_SIZE = "screenshot_huge"` — 1280x720
- **RemotePatterns** en `next.config.ts`: `images.igdb.com`
- **Endpoints IGDB usados**:
  - `searchGames(query, limit)` — búsqueda
  - `getPopularGames(limit, offset)` — más votados
  - `getUpcomingGames(limit)` — próximos lanzamientos
  - `getTrendingGames(limit)` — tendencias (altos votos + screenshots)
  - `getGameById(id)` — detalle completo (storyline, companies, artworks, videos)
- **Proxy.ts** protege `/games/*` y `/game/*` con sesión (usa `getToken` de `next-auth/jwt`)
- **i18n**: 11 keys (`games.popular`, `games.upcoming`, `game.summary`, `game.storyline`, `game.screenshots`, `game.artworks`, `game.videos`, `game.platforms`, `game.developedBy`, `game.publishedBy`, `nav.games`)
- **Navbar**: link "Juegos" visible solo para usuarios autenticados
- **`MediaType`** en `types/tmdb.ts` incluye `"game"`

### Performance
- TMDB cacheado 1 hora (`next: { revalidate: 3600 }`)
- IGDB cacheado 1 hora (`next: { revalidate: 3600 }`)
- next/image para pósters optimizados
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
- [ ] Avatar/subir foto de perfil
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