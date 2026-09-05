"use client";

import { useCallback, useEffect, useState } from "react";

// Rafraîchit l'état de la partie toutes les 2 s (POC — remplacera par du temps réel).
export function usePartyState<T>(code: string, token?: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/parties/${code}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Erreur");
      else {
        setData(json);
        setError(null);
      }
    } catch {
      setError("Connexion perdue");
    }
  }, [code, token]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  return { data, error, refresh };
}
