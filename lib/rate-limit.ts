type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const key = `${bucket}:${clientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs
    });

    return {
      ok: true,
      remaining: limit - 1,
      retryAfter: 0
    };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;

  if (buckets.size > 5000) {
    for (const [storedKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(storedKey);
    }
  }

  return {
    ok: true,
    remaining: limit - current.count,
    retryAfter: 0
  };
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
