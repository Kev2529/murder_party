import { NextRequest } from "next/server";

// Limiteur en mémoire (fenêtre fixe) — cohérent avec le store POC en mémoire.
// Ne survit pas à un redémarrage ni ne se partage entre instances.
//
// Limite : "x-forwarded-for" n'est fiable que derrière un proxy de confiance
// qui le réécrit (ex. Vercel) ; en exposition directe, il est falsifiable et
// un attaquant peut en faire varier la valeur pour contourner la limite par IP.
// Ce n'est donc qu'une défense en profondeur — la protection principale contre
// l'énumération reste l'espace de codes de partie (cf lib/store.ts).
const hits = new Map<string, { count: number; resetAt: number }>();
const MAX_ENTRIES = 20_000;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function sweep(now: number) {
  for (const [k, v] of hits) {
    if (v.resetAt <= now) hits.delete(k);
  }
  // Garde-fou anti-épuisement mémoire si le sweep ne suffit pas à suivre
  // le rythme d'entrées distinctes (ex. IPs falsifiées en rafale).
  if (hits.size > MAX_ENTRIES) hits.clear();
}

export function rateLimit(req: NextRequest, key: string, limit: number, windowMs: number): boolean {
  const bucketKey = `${key}:${clientIp(req)}`;
  const now = Date.now();

  // Purge ponctuelle plutôt qu'à chaque appel : garde le coût amorti bas
  // tout en empêchant la Map de croître indéfiniment.
  if (Math.random() < 0.01) sweep(now);

  const entry = hits.get(bucketKey);
  if (!entry || entry.resetAt <= now) {
    hits.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
