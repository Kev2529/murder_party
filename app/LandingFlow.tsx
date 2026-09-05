"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ScenarioCard = {
  id: string;
  title: string;
  pitch: string;
  universe: string;
  minPlayers: number;
  maxPlayers: number;
};

function Wave({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden
      className={`block h-16 w-full sm:h-24 ${flip ? "rotate-180" : ""}`}
    >
      <path d="M0,60 C240,110 480,-10 760,30 C1040,70 1240,10 1440,50 L1440,90 L0,90 Z" fill={fill} />
    </svg>
  );
}

export function LandingFlow({ scenarios }: { scenarios: ScenarioCard[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ScenarioCard | null>(null);
  const [players, setPlayers] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createParty() {
    if (!selected || !players) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: selected.id, players }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Erreur");
    localStorage.setItem(`ambre:gm:${data.code}`, data.gmToken);
    router.push(`/mj/${data.code}`);
  }

  return (
    <main>
      {/* ——— Héros ——— */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40 bg-nuit"
          style={{ clipPath: "ellipse(90% 100% at 50% -30%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-24 text-center sm:pt-28">
          <p className="text-xs uppercase tracking-[0.4em] text-fume">Ambre présente</p>
          <h1 className="font-display mt-4 text-5xl leading-none text-gold sm:text-7xl">
            MURDER PARTY
          </h1>
          <p className="font-display mt-2 text-xl text-white sm:text-3xl">100% PERSONNALISABLE</p>
          <p className="mx-auto mt-8 max-w-md italic leading-relaxed text-fume">
            Choisissez votre Murder. Choisissez comment vous voulez la vivre. On s&apos;occupe du
            reste : les rôles, les secrets, les indices — jusqu&apos;au dernier rebondissement.
          </p>
          <Link
            href="/rejoindre"
            className="mt-8 inline-block border border-gold/50 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-gold hover:bg-gold/10"
          >
            J&apos;ai un code de partie →
          </Link>
        </div>
      </section>

      {/* ——— 1. Univers ——— */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold italic text-gold sm:text-3xl">Choisissez votre univers</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm italic text-fume">
          Chaque scénario est un monde : ses personnages, ses secrets, sa vérité à découvrir.
        </p>
        <div className="mt-10 flex flex-wrap items-start justify-center gap-8 sm:gap-12">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelected(s);
                setPlayers(null);
              }}
              className="group w-40 text-center"
            >
              <span
                className={`mx-auto flex h-36 w-36 items-center justify-center rounded-full transition sm:h-40 sm:w-40 ${
                  selected?.id === s.id
                    ? "bg-white ring-4 ring-gold"
                    : "bg-white/90 ring-0 group-hover:bg-white group-hover:ring-2 group-hover:ring-gold/60"
                }`}
              >
                <span className="font-display px-4 text-lg leading-tight text-noir">
                  {s.title.split(" ").slice(-1)[0]}
                </span>
              </span>
              <span className="mt-3 block text-sm font-semibold text-white">{s.title}</span>
              <span className="block text-xs italic text-fume">{s.universe}</span>
            </button>
          ))}
          {["Cabaret 1900", "Station Orbitale"].map((t) => (
            <div key={t} className="w-40 text-center opacity-40">
              <span className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-fume/50 sm:h-40 sm:w-40">
                <span className="text-xs uppercase tracking-widest text-fume">Bientôt</span>
              </span>
              <span className="mt-3 block text-sm italic text-fume">{t}</span>
            </div>
          ))}
        </div>
        {selected && (
          <p className="mx-auto mt-8 max-w-xl text-sm italic leading-relaxed text-zinc-300">
            {selected.pitch}
          </p>
        )}
      </section>

      {/* ——— 2. Nombre de joueurs (bande claire) ——— */}
      <Wave fill="#a3a3a3" />
      <section className="-my-px bg-gradient-to-b from-fume to-[#8d8d8d] px-6 py-14 text-center text-noir">
        <h2
          className="text-2xl font-bold italic text-gold sm:text-3xl"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
        >
          Choisissez le nombre de joueurs
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm italic text-noir/70">
          La distribution s&apos;adapte : les personnages essentiels restent, leurs secrets se
          redistribuent.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {selected ? (
            Array.from(
              { length: selected.maxPlayers - selected.minPlayers + 1 },
              (_, i) => selected.minPlayers + i
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPlayers(n)}
                className={`h-12 w-12 rounded-full text-lg font-bold transition ${
                  players === n
                    ? "bg-noir text-gold"
                    : "bg-noir/10 text-noir hover:bg-noir hover:text-white"
                }`}
              >
                {n}
              </button>
            ))
          ) : (
            <p className="text-sm italic text-noir/60">Choisissez d&apos;abord votre univers ↑</p>
          )}
        </div>
      </section>
      <Wave fill="#8d8d8d" flip />

      {/* ——— 3. Synopsis ——— */}
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-10 text-center">
        <h2 className="text-2xl font-bold italic text-gold sm:text-3xl">Recevez votre synopsis</h2>
        <p className="mt-2 italic text-fume">Et la liste des personnages</p>
        <p className="mx-auto mt-6 max-w-md text-sm italic leading-relaxed text-zinc-300">
          Votre partie est créée en un instant : un code à partager, un cockpit pour mener
          l&apos;enquête, et un carnet secret pour chaque joueur.
        </p>
        <button
          onClick={createParty}
          disabled={!selected || !players || loading}
          className="mt-8 bg-gold px-8 py-4 font-display text-lg text-noir transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? "Création…" : "ORGANISER CETTE MURDER"}
        </button>
        {!selected && <p className="mt-3 text-xs italic text-fume">Un univers, un nombre de joueurs — et tout commence.</p>}
        {selected && !players && <p className="mt-3 text-xs italic text-fume">Reste à choisir le nombre de joueurs.</p>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      <footer className="border-t border-white/10 bg-nuit px-6 py-8 text-center text-xs italic text-fume">
        Ambre — plateforme de Murder Parties. MJ professionnel ou événement d&apos;entreprise :
        écrivez-nous.
      </footer>
    </main>
  );
}
