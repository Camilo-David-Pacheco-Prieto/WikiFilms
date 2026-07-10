# Auditoría WikiFilms

> Fecha: 2026-07-09
> Dominio: https://wiki-films-fawn.vercel.app
> Repo: github.com/Camilo-David-Pacheco-Prieto/WikiFilms

---

## Stack Tecnológico

| Componente | Versión |
|-----------|---------|
| Next.js (App Router) | 16.2.10 |
| TypeScript | 5.x strict |
| Tailwind CSS | 4.x |
| shadcn/ui (Base Nova) | latest |
| Prisma | 7.8.0 |
| Base de datos | Vercel Postgres (Neon) |
| Auth | NextAuth 5.0.0-beta.31 |
| Paquetería | pnpm 11.8.0 |
| Fuentes | Oswald (display) + Inter (body) |
| Iconos | lucide-react |

---

## Variables de Entorno Necesarias

```
TMDB_API_KEY=2b4a72141ca6729ae43afd155ad04ef0
DATABASE_URL=<postgres connection string>
AUTH_SECRET=<generated secret>
NEXTAUTH_URL=https://wiki-films-fawn.vercel.app
```

---

## Estructura del Proyecto (62 archivos en `src/`)

```
src/
├── app/
│   ├── (auth)/                       # Grupo de rutas de autenticación
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/users/
│   │   ├── actions.ts                # Server Actions CRUD
│   │   └── page.tsx                  # Panel admin (solo ADMIN)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── auth/register/route.ts        # Registro de usuarios
│   │   ├── auth/update/route.ts          # Actualizar perfil
│   │   ├── favorites/route.ts            # CRUD favoritos
│   │   ├── favorites/check/route.ts      # Verificar favorito
│   │   ├── reviews/route.ts              # CRUD reseñas
│   │   └── watchlist/route.ts            # CRUD watchlist
│   ├── coming-soon/page.tsx
│   ├── dashboard/page.tsx
│   ├── genre/[slug]/                  # (vacío - pendiente)
│   ├── movie/[id]/page.tsx
│   ├── search/
│   │   ├── page.tsx
│   │   └── search-form.tsx
│   ├── settings/page.tsx
│   ├── tv/[id]/page.tsx
│   ├── watchlist/page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── settings-form.tsx
│   ├── content/
│   │   ├── content-card.tsx          # Card con hover reveal
│   │   ├── content-grid.tsx          # Grid responsivo
│   │   ├── detail-hero.tsx           # Hero Marvel-style
│   │   ├── favorite-button.tsx
│   │   ├── footer.tsx                # Footer 3 columnas i18n
│   │   ├── genre-filter.tsx
│   │   ├── hero-backdrops.tsx        # Carrusel de fondos
│   │   ├── language-switcher.tsx     # Globo ghost button
│   │   ├── language-switcher-inline.tsx
│   │   ├── nav-link.tsx              # Link con active state
│   │   ├── navbar.tsx                # Navbar 3 zonas
│   │   ├── navbar-client.tsx         # Menú mobile
│   │   ├── pagination.tsx
│   │   ├── review-section.tsx
│   │   ├── search-bar.tsx            # Input shadcn
│   │   ├── skeleton-card.tsx
│   │   ├── skeleton-grid.tsx
│   │   ├── skeleton-hero.tsx
│   │   ├── trailer-modal.tsx
│   │   ├── user-dropdown.tsx         # Avatar + dropdown
│   │   ├── watch-providers.tsx
│   │   └── watchlist-button.tsx
│   ├── ui/
│   │   ├── avatar.tsx                # shadcn Avatar
│   │   ├── badge.tsx                 # shadcn Badge
│   │   ├── button.tsx                # shadcn Button
│   │   ├── card.tsx                  # shadcn Card
│   │   └── input.tsx                 # shadcn Input
│   └── providers.tsx
├── i18n/
│   ├── config.ts                     # es/en, defaultLocale, cookieName
│   ├── dictionary.ts                 # Lazy-loader de diccionarios
│   ├── get-locale.ts                 # Lee cookie `wiki-lang`
│   ├── language-provider.tsx         # Context + hook useTranslate
│   └── dictionaries/
│       ├── es.json                   # ~170 claves
│       └── en.json                   # ~170 claves
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── prisma.ts                     # Prisma singleton
│   ├── tmdb.ts                       # Servicio TMDB con locale
│   └── utils.ts                      # cn() para shadcn
├── types/
│   └── tmdb.ts                       # Tipos TMDB
└── proxy.ts                          # Proxy server
```

---

## Navbar — Estado Actual (3 zonas)

```
[W WikiFilms]  [Inicio][Explorar][Mi lista][Próximamente]  [🔍 Buscar] [👤] [🌐] [☰]
```

| Zona | Elementos | Archivo |
|------|-----------|---------|
| Izquierda | Logo + NavLinks (NavLink client con active state) | `navbar.tsx:20-59` |
| Derecha | SearchBar (hidden md:block) + mobile search icon | `navbar.tsx:62-72` |
| Usuario | UserDropdown (Avatar) / Login button | `navbar.tsx:74-85` |
| Utilidades | LanguageSwitcher (Button ghost) + NavbarClient hamburger | `navbar.tsx:87-89` |

### UserDropdown (Avatar trigger)
```
Juan Díaz
━━━━━━━━━━━
Favoritos        → /dashboard
Configuración    → /settings
Admin            → /admin/users (solo ADMIN)
━━━━━━━━━━━
Cerrar sesión    → signOut try-catch
```

### Menú Mobile (NavbarClient)
```
Inicio | Explorar | ── | Comunidad [Pronto] | Favoritos | Mi lista | Admin | ── | Idioma (inline) | ── | Cerrar sesión
```

---

## i18n — Internacionalización

| Archivo | Propósito |
|---------|-----------|
| `config.ts` | Define `locales = ["es", "en"]`, `defaultLocale = "es"`, `cookieName = "wiki-lang"` |
| `get-locale.ts` | Lee cookie del server |
| `dictionary.ts` | Carga lazy el JSON según locale |
| `language-provider.tsx` | Provider client-side, hook `useTranslate()` |

**~170 claves** por idioma: nav, home, footer, dashboard, watchlist, auth, userDropdown, content, search, reviews, watchProviders, watchlistButton, favoriteButton, pagination, trailerModal, admin, api, comingSoon.

---

## TMDB — Servicio con Idioma Dinámico

| Función | Endpoint | Uso |
|---------|----------|-----|
| `getPopular(type, page, locale)` | `/{type}/popular` | Home, detail pages |
| `getByGenre(type, genreId, page, locale)` | `/discover/{type}` | Home filtrado |
| `searchContent(query, type, page, locale)` | `/search/{type}` | Search page |
| `getMovieDetail(id, locale)` | `/movie/{id}` | Movie page |
| `getSeriesDetail(id, locale)` | `/tv/{id}` | TV page |
| `getWatchProviders(type, id, locale)` | `/{type}/{id}/watch/providers` | Detail pages |
| `getTrending(type, page, locale)` | `/trending/{type}/week` | Hero backdrops |

Todas aceptan `locale?: string` y lo mapean: `"es"` → `"es-ES"`, cualquier otro → `"en-US"`.

Cache: `next: { revalidate: 3600 }` (1 hora).

---

## Páginas y Funcionalidad

| Ruta | Público | Descripción |
|------|---------|-------------|
| `/` | Sí | Home con hero trending semanal + 12 backdrops rotativos, filtro por género, grid de populares |
| `/search?q=` | Sí | Búsqueda con paginación, filtro movie/tv |
| `/movie/[id]` | Sí | Detalle: hero, watch providers, favoritos, watchlist, reseñas, similares |
| `/tv/[id]` | Sí | Detalle de serie (igual estructura) |
| `/coming-soon` | Sí | 3 cards: Actores, Libros, Anuncios |
| `/login` | No | Login con credenciales |
| `/register` | No | Registro |
| `/dashboard` | Usuario | Perfil + favoritos |
| `/watchlist` | Usuario | Vistas / Por ver |
| `/settings` | Usuario | Configuración perfil |
| `/admin/users` | ADMIN | CRUD de usuarios |

---

## APIs (Route Handlers)

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `POST /api/auth/register` | POST | Registrar usuario (Zod validation, bcrypt) |
| `PATCH /api/auth/update` | PATCH | Actualizar perfil (nombre, email, contraseña) |
| `GET/POST/DELETE /api/favorites` | GET/POST/DELETE | Favoritos por usuario |
| `GET /api/favorites/check` | GET | Verificar si contenido está en favoritos |
| `GET/POST/DELETE /api/watchlist` | GET/POST/DELETE | Watchlist con status (watched/plan_to_watch) |
| `GET/POST/DELETE /api/reviews` | GET/POST/DELETE | Reseñas por contenido |

---

## Hero Backdrops — Flujo Actual

```
getTrending("all", 1, locale) → 20 items (movies + series mix semanal)
  → shuffle (Math.random)
  → .slice(0, 12)
  → HeroBackdrops component (carrusel 8s c/image, fade 1s)
```

---

## Últimos Commits

| Fecha | Hash | Mensaje |
|-------|------|---------|
| 2026-07-09 | `5f66e60` | feat: hero trending semanal + shuffle + 12 backdrops |
| 2026-07-09 | `949581a` | feat: NavLink active state, user dropdown simplificado |
| 2026-07-09 | `5c23d22` | fix: signOut try-catch en user-dropdown y navbar-client |
| 2026-07-09 | `787f1b5` | refactor: navbar profesional 3 zonas, shadcn Input/Avatar, LanguageSwitcher ghost |
| 2026-07-09 | `1ee7d4e` | feat: navbar search bar izquierda, coming-soon page, TMDB language dinámico |

---

## Pendiente (de AGENTS.md)

- PWA (manifest.json + service worker)
- Modo oscuro/claro toggle
- Filtro por género en home ya implementado en `/genre/[slug]` (ruta creada, sin contenido)
- Skeletons de carga ya implementados
- Página 404 personalizada ya implementada (`not-found.tsx`)
- Tests unitarios (Vitest) + E2E (Playwright)
- Rate limiting server-side
- Redis cache
- Webhooks TMDB
- Panel admin con analytics
- CI/CD con GitHub Actions

---

## Notas Técnicas

- El proyecto usa `@base-ui/react` para componentes base de shadcn (Button)
- Los componentes UI (Input, Avatar) fueron creados manualmente siguiendo el patrón shadcn Base Nova
- No hay middleware.ts — NextAuth maneja la protección de rutas internamente
- El proxy en `src/proxy.ts` podría ser para desarrollo local
