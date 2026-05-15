// Rate-limit in-memory ultra-simple — bucket par IP par route.
// Pas d'Upstash/Redis : MKR < 1000 req/jour, single-instance Vercel suffit.
// Si on scale horizontalement plus tard, swap pour Upstash @upstash/ratelimit.
//
// Le bucket leaks sur restart serverless (cold start) mais c'est OK :
// un attaquant ne peut pas exploiter ce reset car il s'applique aussi a lui.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Garbage collect periodique pour eviter une fuite memoire si beaucoup d'IPs.
let lastGc = 0
function gc(now: number) {
  if (now - lastGc < 60_000) return
  lastGc = now
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}

export interface RateLimitOptions {
  // Identifiant unique : combine route + IP. Ex: 'contact:1.2.3.4'.
  key: string
  // Nombre max de requetes dans la fenetre.
  limit: number
  // Fenetre en secondes.
  windowSeconds: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
}

export function rateLimit({ key, limit, windowSeconds }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  gc(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1, resetIn: windowSeconds }
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  bucket.count += 1
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetIn: Math.ceil((bucket.resetAt - now) / 1000),
  }
}

// Helper : extrait l'IP client (Vercel pose x-forwarded-for).
export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}
