# WikiFilms 🎬

**Tu enciclopedia cinematográfica personal.** Explora películas y series con información detallada, puntuaciones, elenco y más. Consume la API de TMDB con un diseño oscuro cinematográfico inspirado en Marvel Comics.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **Base de datos:** Vercel Postgres + Prisma 7
- **Autenticación:** NextAuth v5 (Credentials + bcrypt)
- **Despliegue:** Vercel

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
AUTH_SECRET=tu_secreto
NEXTAUTH_URL=http://localhost:3000
```

## Comandos

| Comando | Descripción |
|---------|-----------|
| `pnpm dev` | Servidor desarrollo |
| `pnpm build` | Compilar producción |
| `pnpm prisma migrate deploy` | Migrar DB |
| `pnpm lint` | ESLint |

## Rutas

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/` | Home con populares | Pública |
| `/movie/[id]` | Detalle película | Pública |
| `/tv/[id]` | Detalle serie | Pública |
| `/search` | Búsqueda | Pública |
| `/login` | Iniciar sesión | Pública |
| `/register` | Registrarse | Pública |
| `/dashboard` | Mi perfil | Requiere sesión |
| `/admin/users` | CRUD usuarios | Requiere ADMIN |

## Licencia

MIT