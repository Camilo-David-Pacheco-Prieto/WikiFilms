import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface SSENotification {
  id: string;
  actorName: string;
  type: string;
  reviewId: string | null;
  contentId: number | null;
  contentType: string | null;
  read: boolean;
  createdAt: Date;
}

async function fetchData(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({
      where: { userId, read: false },
    }),
  ]);

  const actorIds = [...new Set(notifications.map((n) => n.actorId))];
  const actors = actorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a.name]));

  const result: SSENotification[] = notifications.map((n) => ({
    id: n.id,
    actorName: actorMap.get(n.actorId) ?? "Unknown",
    type: n.type,
    reviewId: n.reviewId,
    contentId: n.contentId,
    contentType: n.contentType,
    read: n.read,
    createdAt: n.createdAt,
  }));

  return { notifications: result, unreadCount };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = async () => {
        if (closed) return;
        try {
          const payload = await fetchData(userId);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (e) {
          console.error("SSE send error:", e);
        }
      };

      // Initial payload
      await send();

      // Re-sync every 6s
      const interval = setInterval(send, 6000);

      // Keepalive ping every 8s (avoids proxy timeouts)
      const ping = setInterval(() => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(":ping\n\n")); } catch {}
      }, 8000);

      // Graceful close before Vercel 10s timeout
      const timeout = setTimeout(() => {
        closed = true;
        clearInterval(interval);
        clearInterval(ping);
        try { controller.close(); } catch {}
      }, 9500);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        clearInterval(ping);
        clearTimeout(timeout);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
