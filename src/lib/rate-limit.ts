/**
 * Simple in-memory rate limiter.
 * For a multi-instance deployment, use Redis instead.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

/**
 * Returns true if the request should be allowed, false if rate-limited.
 */
export function checkRateLimit(identifier: string, opts: RateLimitOptions): boolean {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || entry.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + opts.windowSec * 1000 })
    return true
  }

  if (entry.count >= opts.limit) return false

  entry.count++
  return true
}
