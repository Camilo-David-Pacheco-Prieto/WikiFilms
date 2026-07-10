# Funcionalidades Implementadas

## Sistema de Resenas

Los usuarios autenticados pueden publicar, editar y eliminar resenas con calificacion del 1 al 10.

- `GET /api/reviews?contentId={id}` — obtiene resenas de un contenido
- `POST /api/reviews` — crea/actualiza resena del usuario autenticado
- Las resenas propias aparecen primero en la lista

## Reacciones (Like / Dislike)

Cada resena tiene botones 👍/👎.

- `POST /api/reviews/{id}/reactions` — togglea like/dislike
- Una misma resena no permite ambos: si ya tiene like y se da dislike, cambia a dislike
- Tercer click remueve la reaccion
- Se notifica al autor de la resena (si no es el mismo usuario)

## Comentarios con Hilos Anidados

Los comentarios en resenas soportan respuestas anidadas con profundidad ilimitada.

### API

- `GET /api/reviews/{id}/comments` — devuelve comentarios planos con `parentId` y `parentUser` (nombre del autor del comentario padre)
- `POST /api/reviews/{id}/comments` — crea un comentario; acepta `parentId` opcional para responder a otro comentario

### UI

- Arbol recursivo con indentacion visual (`ml-6` + borde izquierdo por nivel)
- Cada comentario tiene boton "Responder" que abre un formulario inline
- El formulario principal de la raiz solo se muestra cuando no se esta respondiendo a ningun comentario
- Comentarios con profundidad >= 3 se colapsan automaticamente; boton "Ver N respuestas" para expandir
- Al responder se notifica al autor del comentario padre (con tipo `REPLY`)

### Modelo Prisma

```prisma
model ReviewComment {
  id        String         @id @default(cuid())
  reviewId  String
  userId    String
  parentId  String?
  comment   String
  createdAt DateTime       @default(now())
  parent    ReviewComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   ReviewComment[] @relation("CommentReplies")
  user      User           @relation(fields: [userId], references: [id])
  review    Review         @relation(fields: [reviewId], references: [id])
}
```

## Notificaciones

Sistema completo de notificaciones en tiempo real con polling.

### Modelo

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  actorId     String
  type        String   // LIKE | DISLIKE | COMMENT | REPLY
  reviewId    String?
  contentId   Int?
  contentType String?  // "movie" | "tv"
  message     String?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### API

- `GET /api/notifications` — devuelve ultimas 20 notificaciones del usuario con `actorName` via join
- `PATCH /api/notifications` — marca una notificacion como leida (por `id`)
- `POST /api/notifications/read-all` — marca todas como leidas

### UI (NotificationBell)

- Icono de campana con badge del conteo de no leidas
- Dropdown solo muestra notificaciones **no leidas**
- Cada notificacion muestra: icono segun tipo, nombre del actor, mensaje, tiempo relativo
- Polling cada 30s para refrescar
- Click en notificacion: la marca como leida (optimistic update + verifica `res.ok`) y navega al contenido con hash `#review-{reviewId}` para scrollear a la resena especifica
- Boton "Ver historial" al pie del dropdown → `/notifications`
- Pagina `/notifications`: listado completo de ultimas 50 notificaciones (leidas y no leidas) con indicador de estado

### Disparadores de Notificaciones

| Accion | Tipo | Destinatario |
|--------|------|-------------|
| Comentar en resena | `COMMENT` | Autor de la resena (si no es el mismo) |
| Responder a comentario | `REPLY` | Autor del comentario padre (si no es el mismo ni el autor de la resena) |
| Like a resena | `LIKE` | Autor de la resena |
| Dislike a resena | `DISLIKE` | Autor de la resena |

## Navegacion por Hash a Resenas

Al hacer clic en una notificacion relacionada a una resena, la URL incluye `#review-{reviewId}`.

Al cargar la pagina, un `useEffect` detecta el hash, hace `scrollIntoView` sobre la resena y aplica un highlight visual (ring de color acento) que desaparece tras 2 segundos.

## Historial de Notificaciones (`/notifications`)

Pagina servidor que lista las ultimas 50 notificaciones del usuario autenticado, ordenadas por fecha descendente. Incluye nombre del actor (resuelto via consulta a tabla User), icono segun tipo, estado leido/no leido, y enlace directo al contenido.
