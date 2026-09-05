"use client";

import { use, useEffect, useState } from "react";
import { usePartyState } from "@/lib/usePoll";

type PlayerData = {
  role: string;
  playerName: string;
  lobby: { scenario: { title: string } };
  view: {
    character: { name: string; publicPitch: string; privateSheet: string };
    objectives: { id: string; label: string; content: string }[];
    secrets: { id: string; label: string; content: string }[];
    infos: { id: string; label: string; content: string }[];
    clues: { id: string; kind: string; label: string; content: string }[];
    relationships: { with: string; know: string }[];
    others: { id: string; name: string; publicPitch: string }[];
    announcements: { at: number; text: string }[];
    currentAct: string | null;
  };
};

type SectionKey =
  | "personnage"
  | "objectifs"
  | "secrets"
  | "savoir"
  | "indices"
  | "relations"
  | "convives"
  | "annonces";

const ICON_PATHS: Record<SectionKey, React.ReactNode> = {
  personnage: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  objectifs: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  secrets: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  savoir: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  indices: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M15.5 15.5 21 21" />
    </>
  ),
  relations: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 10.8 15.7 7.2M8.3 13.2l7.4 3.6" />
    </>
  ),
  convives: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M17 14.5c2.7.3 4.5 2 4.5 4.5" />
    </>
  ),
  annonces: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
};

function Icon({ name, className }: { name: SectionKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// Cercle-portrait blanc avec initiale en Ultra — écho aux cercles de la landing.
function Portrait({ name, size = "h-11 w-11 text-lg" }: { name: string; size?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white text-noir ${size}`}>
      <span className="font-display">{name.charAt(0)}</span>
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="mt-10 text-center text-sm italic text-zinc-500">{text}</p>;
}

export default function JoueurPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [section, setSection] = useState<SectionKey | null>(null);
  const [seenAnnonces, setSeenAnnonces] = useState(0);

  useEffect(() => {
    setToken(localStorage.getItem(`ambre:${code}`));
    setSeenAnnonces(Number(localStorage.getItem(`ambre:seen:${code}`) ?? 0));
  }, [code]);

  const { data, error } = usePartyState<PlayerData>(code, token);

  if (token === null || (!data && !error) || (data && data.role !== "player"))
    return <main className="px-6 py-20 text-center text-zinc-500">Chargement…</main>;
  if (error)
    return (
      <main className="px-6 py-20 text-center">
        <p className="text-red-400">{error}</p>
        <a href={`/rejoindre?code=${code}`} className="mt-4 inline-block text-gold underline">
          Rejoindre la partie
        </a>
      </main>
    );

  const v = data!.view;
  const unread = v.announcements.length - seenAnnonces;

  function openSection(key: SectionKey) {
    if (key === "annonces") {
      localStorage.setItem(`ambre:seen:${code}`, String(v.announcements.length));
      setSeenAnnonces(v.announcements.length);
    }
    setSection(key);
    window.scrollTo(0, 0);
  }

  const tiles: { key: SectionKey; label: string; hint: string; alert?: boolean; danger?: boolean }[] = [
    { key: "personnage", label: "Votre personnage", hint: "Votre fiche" },
    { key: "objectifs", label: "Objectifs", hint: `${v.objectives.length} à accomplir` },
    { key: "secrets", label: "Secrets", hint: `${v.secrets.length} à protéger`, danger: true },
    { key: "savoir", label: "Ce que vous savez", hint: `${v.infos.length} information${v.infos.length > 1 ? "s" : ""}` },
    { key: "indices", label: "Indices & documents", hint: `${v.clues.length} en votre possession` },
    { key: "relations", label: "Relations", hint: `${v.relationships.length} lien${v.relationships.length > 1 ? "s" : ""}` },
    { key: "convives", label: "Les convives", hint: `${v.others.length} autres personnages` },
    {
      key: "annonces",
      label: "Annonces",
      hint: unread > 0 ? `${unread} nouvelle${unread > 1 ? "s" : ""}` : `${v.announcements.length} reçue${v.announcements.length > 1 ? "s" : ""}`,
      alert: unread > 0,
    },
  ];

  // ——— Vue dézoomée : le dashboard ———
  if (!section) {
    return (
      <main className="mx-auto max-w-xl px-5 py-8 pb-24">
        <header className="flex items-center gap-4 border-b border-zinc-800 pb-5">
          <Portrait name={v.character.name} size="h-16 w-16 text-2xl" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-500">
              {data!.lobby.scenario.title} · {code}
            </p>
            <h1 className="font-display text-2xl leading-tight text-gold">{v.character.name}</h1>
            <p className="text-sm text-zinc-400">
              joué par {data!.playerName}
              {v.currentAct && (
                <span className="ml-2 rounded bg-gold/10 px-2 py-0.5 text-xs text-gold">{v.currentAct}</span>
              )}
            </p>
          </div>
        </header>

        {!v.currentAct && (
          <p className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm italic text-zinc-400">
            En attente du début de la partie… Profitez-en pour relire votre fiche.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <button
              key={t.key}
              onClick={() => openSection(t.key)}
              className={`relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                t.danger
                  ? "border-red-900/60 bg-red-950/15 hover:border-red-700/70"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-gold/50"
              }`}
            >
              {t.alert && (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              )}
              <Icon name={t.key} className={`h-7 w-7 ${t.danger ? "text-red-400" : "text-gold"}`} />
              <span>
                <span className="block text-sm font-semibold leading-tight">{t.label}</span>
                <span className="mt-0.5 block text-xs text-zinc-500">{t.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ——— Vue d'un bloc ———
  const tile = tiles.find((t) => t.key === section)!;
  return (
    <main className="mx-auto max-w-xl px-5 py-6 pb-24">
      <button
        onClick={() => setSection(null)}
        className="text-sm text-zinc-400 transition hover:text-gold"
      >
        ← {v.character.name}
      </button>
      <header className="mt-4 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Icon name={section} className={`h-8 w-8 ${tile.danger ? "text-red-400" : "text-gold"}`} />
        <h1 className={`text-2xl font-bold italic ${tile.danger ? "text-red-400" : "text-gold"}`}>
          {tile.label}
        </h1>
      </header>

      {section === "personnage" && (
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Portrait name={v.character.name} size="h-20 w-20 text-3xl" />
            <div>
              <p className="font-display text-xl text-white">{v.character.name}</p>
              <p className="mt-1 text-sm italic leading-relaxed text-zinc-400">{v.character.publicPitch}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-gold/25 bg-zinc-900/60 p-5">
            <p className="mb-2 text-[11px] uppercase tracking-widest text-gold/70">Pour vos yeux seulement</p>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-zinc-200">
              {v.character.privateSheet}
            </p>
          </div>
        </div>
      )}

      {section === "objectifs" && (
        <div className="mt-6 space-y-3">
          {v.objectives.length === 0 && <EmptyState text="Aucun objectif — pour l'instant." />}
          {v.objectives.map((o) => (
            <div key={o.id} className="rounded-r-xl border-l-4 border-gold bg-zinc-900/60 p-4">
              <p className="font-semibold text-gold-bright">{o.label}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-300">{o.content}</p>
            </div>
          ))}
        </div>
      )}

      {section === "secrets" && (
        <div className="mt-6 space-y-3">
          <p className="text-center text-xs uppercase tracking-widest text-red-400/80">
            Ne les montrez à personne
          </p>
          {v.secrets.length === 0 && <EmptyState text="Vous n'avez rien à cacher. Vraiment ?" />}
          {v.secrets.map((s) => (
            <div key={s.id} className="rounded-xl border border-red-900/60 bg-red-950/15 p-4">
              <p className="flex items-center gap-2 font-semibold text-red-300">
                <Icon name="secrets" className="h-4 w-4" /> {s.label}
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-300">{s.content}</p>
            </div>
          ))}
        </div>
      )}

      {section === "savoir" && (
        <div className="mt-6 space-y-3">
          {v.infos.length === 0 && <EmptyState text="Rien pour l'instant — écoutez, observez." />}
          {v.infos.map((i) => (
            <div key={i.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="font-semibold text-zinc-100">{i.label}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-400">{i.content}</p>
            </div>
          ))}
        </div>
      )}

      {section === "indices" && (
        <div className="mt-6 space-y-4">
          {v.clues.length === 0 && <EmptyState text="Aucun indice pour l'instant — ouvrez l'œil." />}
          {v.clues.map((c) =>
            c.kind === "document" ? (
              // Les documents sont du papier : clair, typé machine à écrire.
              <div key={c.id} className="rotate-[0.4deg] rounded-sm bg-[#f5f2ec] p-5 text-noir shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.25em] text-noir/50">Document</p>
                <p className="mt-1 font-mono text-sm font-bold">{c.label}</p>
                <p className="mt-3 whitespace-pre-line font-mono text-[13px] leading-relaxed text-noir/80">
                  {c.content}
                </p>
              </div>
            ) : (
              <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">{c.kind}</p>
                <p className="mt-1 font-semibold text-zinc-100">{c.label}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-400">{c.content}</p>
              </div>
            )
          )}
        </div>
      )}

      {section === "relations" && (
        <div className="mt-6 space-y-3">
          {v.relationships.length === 0 && <EmptyState text="Personne ne vous est proche ici." />}
          {v.relationships.map((r, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <Portrait name={r.with} />
              <div>
                <p className="font-semibold text-zinc-100">{r.with}</p>
                <p className="mt-1 text-[15px] italic leading-relaxed text-zinc-400">{r.know}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "convives" && (
        <div className="mt-6 space-y-3">
          {v.others.map((o) => (
            <div key={o.id} className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <Portrait name={o.name} />
              <div>
                <p className="font-semibold text-zinc-100">{o.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{o.publicPitch}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "annonces" && (
        <div className="mt-6 space-y-3">
          {v.announcements.length === 0 && <EmptyState text="Le silence, pour l'instant." />}
          {[...v.announcements].reverse().map((a, i) => (
            <div key={i} className="rounded-xl border border-gold/25 bg-gold/5 p-4">
              <p className="text-[11px] text-zinc-500">
                {new Date(a.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-zinc-200">{a.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
