# Arquitectura de WikiFilms

## Estructura del Proyecto

```
src/
 app/                     # App Router de Next.js
  (auth)/                 # Grupo de rutas de autenticacion
   login/page.tsx
   register/page.tsx
  admin/users/            # Panel admin
  api/                    # API endpoints (Route Handlers)
   auth/[...nextauth]/
   auth/register/
   auth/update/
   favorites/
   favorites/check/
   notifications/
   notifications/read-all/
   reviews/
   reviews/[id]/comments/
   reviews/[id]/reactions/
   watchlist/
  dashboard/
  movie/[id]/
  tv/[id]/
  search/
  settings/
  watchlist/
  notifications/          # Pagina de historial de notificaciones
  coming-soon/
  globals.css
  layout.tsx
  page.tsx               # Home
 components/
  auth/                  # Formularios de login/registro
  content/               # Componentes de contenido
   content-card.tsx
   content-grid.tsx
   detail-hero.tsx
   navbar.tsx
   review-section.tsx    # Resenas + reacciones + comentarios anidados
   notification-bell.tsx # Campana de notificaciones con dropdown
  ui/                    # Componentes shadcn/ui base
 lib/
  auth.ts                # Configuracion NextAuth (handlers + adapter)
  prisma.ts              # Cliente Prisma singleton con adapter Neon
  tmdb.ts                # Servicio TMDB con fetch cacheado
  utils.ts               # Utilidades (cn de shadcn)
 types/
  tmdb.ts                # Tipos de TMDB API
 middleware.ts           # Proteccion de rutas
```

## Patrones y Convenciones

### Server Components por defecto
Todas las paginas son server components. Solo se usa "use client" cuando es estrictamente necesario (interactividad, hooks).

### API Route Handlers
Los endpoints siguen el patron:
- Session check al inicio
- Try-catch con NextResponse.json(error, status: 500)
- Prisma queries directas (sin incluir en create para evitar transacciones en Neon HTTP)

### Manejo de errores Neon HTTP
Prisma 7 con adapter Neon HTTP no soporta transacciones. Por eso:
- No se usa include en create queries (se hace un segundo query separado)
- En vez de updateMany se usa raw SQL via executeRaw
- Las operaciones se hacen en queries separados en vez de transacciones

### Base de Datos
- Vercel Postgres (Neon) via @prisma/adapter-neon
- Migraciones via prisma migrate deploy en build
- Tablas principales: User, Review, ReviewReaction, ReviewComment, Notification, Favorite, WatchlistEntry

### Autenticacion
- NextAuth v5 con estrategia Credentials
- Passwords hasheados con bcrypt (12 rounds)
- Sesiones via JWT con AUTH_SECRET
- Handler exportado en lib/auth.ts, usado globalmente

### Estilos
- Paleta de colores via CSS variables en globals.css
- color-base, color-surface, color-accent-brand (cambiable globalmente)
- Glassmorphism con backdrop-blur y bg semi-transparente
- Tipografia: Oswald para displays (mayusculas), Inter para cuerpo

### Cache
- TMDB: fetch con next: revalidate: 3600 (1 hora)
- No hay Redis todavia (planeado para Fase 4)

## Flujo de Despliegue

1. Push a main en GitHub
2. Vercel detecta el push e inicia build
3. Build ejecuta: prisma generate + prisma migrate deploy + next build
4. Si hay migraciones nuevas, se aplican a la DB de produccion
5. Static pages se generan, dynamic pages quedan como serverless functions
6. Deploy completado, sitio actualizado

## Variables de Entorno (Produccion)

```
TMDB_API_KEY=2b4a72141ca6729ae43afd155ad04ef0
DATABASE_URL= (desde Vercel Postgres Storage)
AUTH_SECRET= (generado con openssl rand -base64 32)
NEXTAUTH_URL=https://wiki-films-fawn.vercel.app
```
