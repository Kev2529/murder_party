"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePartyState } from "@/lib/usePoll";
import type { Action } from "@/lib/engine/types";

type GmData = {
  role: string;
  lobby: {
    code: string;
    scenario: { title: string };
    cast: { id: string; name: string; claimedBy: string | null }[];
    started: boolean;
  };
  view: {
    scenario: { title: string; pitch: string; solution: string; timeline: { time: string; fact: string }[] };
    acts: {
      id: string;
      title: string;
      intro: string;
      gmInstructions: string;
      opened: boolean;
      events: { id: string; label: string; description: string; gmInstructions: string; triggered: boolean }[];
      clues: { id: string; label: string }[];
    }[];
    looseEvents: { id: string; label: string; description: string; gmInstructions: string; triggered: boolean }[];
    characters: {
      id: string;
      name: string;
      knownInfos: { id: string; label: string }[];
      heldClues: { id: string; label: string }[];
    }[];
    infos: { id: string; label: string; content: string; essential: boolean }[];
    clues: { id: string; kind: string; label: string; content: string; distributedTo: string[] }[];
    gmDuties: { info: { id: string; label: string; content: string }; from: string }[];
    journal: { at: number; summary: string }[];
  };
};

function Cockpit({ code }: { code: string }) {
  const queryToken = useSearchParams().get("token");
  const [token, setToken] = useState<string | null>(null);

  // Le token ne vit pas dans l'URL : s'il arrive par lien, on le range et on nettoie.
  useEffect(() => {
    if (queryToken) {
      localStorage.setItem(`ambre:gm:${code}`, queryToken);
      window.history.replaceState(null, "", `/mj/${code}`);
      setToken(queryToken);
    } else {
      setToken(localStorage.getItem(`ambre:gm:${code}`) ?? "");
    }
  }, [code, queryToken]);

  const { data, error, refresh } = usePartyState<GmData>(code, token);
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(action: Action) {
    setActionError(null);
    const res = await fetch(`/api/parties/${code}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    if (!res.ok) setActionError((await res.json()).error ?? "Erreur");
    refresh();
  }

  if (error) return <main className="px-6 py-20 text-center text-red-400">{error}</main>;
  if (token === null || !data)
    return <main className="px-6 py-20 text-center text-zinc-500">Chargement…</main>;
  if (data.role !== "gm")
    return (
      <main className="px-6 py-20 text-center text-zinc-400">
        Ce cockpit appartient à l&apos;organisateur de la partie.
      </main>
    );

  const { lobby, view } = data;
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/rejoindre?code=${code}` : "";
  const castName = (id: string) => lobby.cast.find((c) => c.id === id)?.name ?? id;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 pb-24">
      <header className="border-b border-zinc-800 pb-5">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Cockpit MJ · {view.scenario.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <span className="font-display rounded-lg bg-gold/10 px-4 py-2 text-2xl tracking-widest text-gold">
            {code}
          </span>
          <div className="text-sm text-zinc-400">
            <p>Les joueurs rejoignent sur :</p>
            <p className="select-all font-mono text-gold">{joinUrl}</p>
          </div>
        </div>
      </header>

      {actionError && <p className="mt-4 rounded bg-red-950/50 p-3 text-sm text-red-400">{actionError}</p>}

      {/* Joueurs */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Distribution</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {lobby.cast.map((c) => (
            <div key={c.id} className={`rounded-lg border p-3 text-sm ${c.claimedBy ? "border-emerald-900/60" : "border-zinc-800"}`}>
              <p className="font-semibold">{c.name}</p>
              <p className={c.claimedBy ? "text-emerald-400" : "text-zinc-500"}>{c.claimedBy ?? "en attente…"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* À transmettre par le MJ (redistributions) */}
      {view.gmDuties.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-400">
            À transmettre par vous (personnage absent)
          </h2>
          <div className="space-y-2">
            {view.gmDuties.map((d) => (
              <div key={d.info.id} className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm">
                <p className="font-semibold">{d.info.label}</p>
                <p className="text-zinc-400">{d.info.content}</p>
                <p className="mt-1 text-xs text-red-400/80">Portée par {d.from}, hors distribution — à glisser en jeu.</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actes */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Déroulé</h2>
        <div className="space-y-3">
          {view.acts.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 ${a.opened ? "border-gold/40" : "border-zinc-800"}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{a.title}</h3>
                {a.opened ? (
                  <span className="text-xs text-gold">en cours</span>
                ) : (
                  <button
                    onClick={() => act({ type: "openAct", actId: a.id })}
                    className="rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-gold-bright"
                  >
                    Ouvrir l&apos;acte
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm italic text-zinc-400">{a.intro}</p>
              <p className="mt-1 text-sm text-zinc-500">MJ : {a.gmInstructions}</p>
              {a.events.length > 0 && (
                <div className="mt-3 space-y-2">
                  {a.events.map((e) => (
                    <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg bg-zinc-900/80 p-3 text-sm">
                      <div>
                        <p className={`font-medium ${e.triggered ? "text-zinc-500 line-through" : ""}`}>{e.label}</p>
                        <p className="text-zinc-500">{e.gmInstructions}</p>
                      </div>
                      {!e.triggered && (
                        <button
                          onClick={() => act({ type: "triggerEvent", eventId: e.id })}
                          className="shrink-0 rounded border border-gold/50 px-3 py-1 text-gold hover:bg-gold/10"
                        >
                          Déclencher
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Indices */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Indices & documents</h2>
        <div className="space-y-2">
          {view.clues.map((c) => (
            <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    <span className="mr-1 text-xs uppercase text-zinc-500">[{c.kind}]</span>
                    {c.label}
                  </p>
                  <p className="mt-1 text-zinc-400">{c.content}</p>
                  {c.distributedTo.length > 0 && (
                    <p className="mt-1 text-xs text-emerald-400">Détenu par {c.distributedTo.map(castName).join(", ")}</p>
                  )}
                </div>
                <GiveTo
                  onGive={(to) => act({ type: "giveClue", clueId: c.id, to })}
                  cast={lobby.cast}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Annonce libre */}
      <FreeAnnounce onSend={(text) => act({ type: "announce", text })} />

      {/* Vue par personnage */}
      <details className="mt-6 rounded-xl border border-zinc-800 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-400">Qui sait quoi ?</summary>
        <div className="mt-3 space-y-3 text-sm">
          {view.characters.map((c) => (
            <div key={c.id}>
              <p className="font-semibold text-gold">{c.name}</p>
              <p className="text-zinc-400">
                Sait : {c.knownInfos.map((i) => i.label).join(" · ") || "—"}
              </p>
              <p className="text-zinc-500">
                Détient : {c.heldClues.map((i) => i.label).join(" · ") || "—"}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Solution & chronologie */}
      <details className="mt-4 rounded-xl border border-red-900/40 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-red-400">Solution & chronologie (MJ uniquement)</summary>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{view.scenario.solution}</p>
        <ul className="mt-3 space-y-1 text-sm text-zinc-400">
          {view.scenario.timeline.map((t, i) => (
            <li key={i}>
              <span className="font-mono text-xs text-gold">{t.time}</span> — {t.fact}
            </li>
          ))}
        </ul>
      </details>

      {/* Journal */}
      {view.journal.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Journal</h2>
          <ul className="space-y-1 text-sm text-zinc-500">
            {[...view.journal].reverse().map((j, i) => (
              <li key={i}>
                <span className="font-mono text-xs">{new Date(j.at).toLocaleTimeString("fr-FR")}</span> — {j.summary}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function GiveTo({ cast, onGive }: { cast: { id: string; name: string }[]; onGive: (to: string) => void }) {
  return (
    <select
      value=""
      onChange={(e) => e.target.value && onGive(e.target.value)}
      className="shrink-0 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
    >
      <option value="">Remettre à…</option>
      <option value="all">Tous</option>
      {cast.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

function FreeAnnounce({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Annonce à tous</h2>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Un cri retentit à l'étage…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder-zinc-600 focus:border-gold focus:outline-none"
        />
        <button
          onClick={() => {
            if (text.trim()) {
              onSend(text.trim());
              setText("");
            }
          }}
          className="rounded-lg border border-gold/50 px-4 text-sm text-gold hover:bg-gold/10"
        >
          Envoyer
        </button>
      </div>
    </section>
  );
}

export default function MjPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <Suspense>
      <Cockpit code={code} />
    </Suspense>
  );
}
