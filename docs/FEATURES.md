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

- `GET /api/reviews/{id}/comments?sort=new|old|top` — devuelve comentarios planos con `parentId`, `parentUser`, `likes`, `dislikes`, `myReaction`, `editedAt`, `deletedAt`. Sort: new (desc), old (asc), top (score = likes - dislikes)
- `POST /api/reviews/{id}/comments` — crea un comentario; acepta `parentId` opcional para responder; maximo 2000 caracteres; notifica al autor del padre
- `PATCH /api/reviews/{id}/comments/{commentId}` — edita el texto (setea `editedAt`); solo el dueno
- `DELETE /api/reviews/{id}/comments/{commentId}` — soft delete si tiene hijos (setea `deletedAt`), hard delete si no tiene hijos
- `POST /api/reviews/{id}/comments/{commentId}/reactions` — togglea like/dislike en un comentario; notifica al autor del comentario

### UI

- Arbol recursivo con indentacion visual (`ml-6` + borde izquierdo por nivel)
- Cada comentario tiene boton "Responder" que abre un formulario inline
- El formulario principal de la raiz solo se muestra cuando no se esta respondiendo a ningun comentario
- Comentarios con profundidad >= 3 se colapsan automaticamente; boton "Ver N respuestas" para expandir
- Sort tabs: "Nuevos", "Antiguos", "Populares" que reordenan sin perder el arbol (los padres se mueven, los hijos siguen a su padre)
- Cada comentario muestra botones 👍/👎 con conteos; highlight segun reaccion del usuario
- Botones "Editar" y "Eliminar" visibles solo para el dueno del comentario
- Edicion inline: al hacer clic en "Editar" el texto se convierte en textarea con botones "Guardar"/"Cancelar"
- Eliminacion: modal de confirmacion; si se confirma, el comentario muestra "[eliminado]" (soft delete conserva el arbol de replies)
- Hash highlight: si la URL contiene `#comment-{id}`, se hace scroll y highlight al comentario
- Limite de 2000 caracteres al escribir/editar

### Modelos Prisma

```prisma
model ReviewComment {
  id        String         @id @default(cuid())
  reviewId  String
  userId    String
  parentId  String?
  comment   String
  createdAt DateTime       @default(now())
  editedAt  DateTime?
  deletedAt DateTime?
  parent    ReviewComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   ReviewComment[] @relation("CommentReplies")
  reactions CommentReaction[]
  user      User           @relation(fields: [userId], references: [id])
  review    Review         @relation(fields: [reviewId], references: [id])
}

model CommentReaction {
  id        String   @id @default(cuid())
  commentId String
  userId    String
  type      String   // LIKE | DISLIKE
  createdAt DateTime @default(now())
  comment   ReviewComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User          @relation(fields: [userId], references: [id])

  @@unique([commentId, userId])
}
```

## Notificaciones

Sistema completo de notificaciones en tiempo real con SSE (Server-Sent Events).

### Modelo

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  actorId     String
  type        String   // LIKE | DISLIKE | COMMENT | REPLY | COMMENT_LIKE | COMMENT_DISLIKE
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
- `GET /api/notifications/stream` — SSE endpoint: emite eventos `notification` (nueva notificacion) y `ping` cada 9s para mantener conexion; re-sync de no leidas cada 6s; auto-reconnect cada ~9.5s en Vercel (por timeout de Edge Functions)

### UI (NotificationBell)

- Icono de campana con badge del conteo de no leidas
- Dropdown solo muestra notificaciones **no leidas**
- Cada notificacion muestra: icono segun tipo, nombre del actor, mensaje, tiempo relativo
- **SSE en tiempo real** via EventSource (reemplazo del polling 30s):
  - `pendingReads` Set para evitar race conditions al mergear notificaciones nuevas con las existentes
  - Re-sync periodico garantiza que no se pierdan notificaciones si el SSE se reconecta
  - Ping cada 9s mantiene la conexion viva
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
| Like a comentario | `COMMENT_LIKE` | Autor del comentario |
| Dislike a comentario | `COMMENT_DISLIKE` | Autor del comentario |

## Navegacion por Hash a Resenas y Comentarios

Al hacer clic en una notificacion relacionada a una resena, la URL incluye `#review-{reviewId}`. Para un comentario especifico, la URL incluye `#comment-{commentId}`.

Al cargar la pagina, un `useEffect` detecta el hash, hace `scrollIntoView` sobre el elemento y aplica un highlight visual (ring de color acento) que desaparece tras 2 segundos.

## Historial de Notificaciones (`/notifications`)

Pagina servidor que lista las ultimas 50 notificaciones del usuario autenticado, ordenadas por fecha descendente. Incluye nombre del actor (resuelto via consulta a tabla User), icono segun tipo, estado leido/no leido, y enlace directo al contenido.
