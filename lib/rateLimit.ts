import { NextRequest } from "next/server";

// Limiteur en mémoire (fenêtre fixe) — cohérent avec le store POC en mémoire.
// Ne survit pas à un redémarrage ni ne se partage entre instances, mais suffit
// à décourager l'énumération de codes de partie pour cet usage (soirée privée).
const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(req: NextRequest, key: string, limit: number, windowMs: number): boolean {
  const bucketKey = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const entry = hits.get(bucketKey);

  if (!entry || entry.resetAt <= now) {
    hits.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
