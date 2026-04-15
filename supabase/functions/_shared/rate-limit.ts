// Shared in-memory rate limiter for edge functions
// Resets on cold start — acceptable for edge function lifecycle

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limiters = new Map<string, Map<string, RateLimitEntry>>();

export function rateLimit(
  bucketName: string,
  key: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000
): { limited: boolean; remaining: number; retryAfterMs: number } {
  if (!limiters.has(bucketName)) {
    limiters.set(bucketName, new Map());
  }
  const bucket = limiters.get(bucketName)!;
  const now = Date.now();
  const entry = bucket.get(key);

  if (!entry || now > entry.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return {
      limited: true,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  return { limited: false, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

export function getRateLimitedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": "900",
      },
    }
  );
}
