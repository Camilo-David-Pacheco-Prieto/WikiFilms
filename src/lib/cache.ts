import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const DEFAULT_TTL = 3600;

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) return cached;
  } catch {
    // Redis unavailable — proceed to live fetch
  }

  const data = await fetcher();

  try {
    await redis.set(key, data, { ex: ttl });
  } catch {
    // Cache write failure — non-critical
  }

  return data;
}
