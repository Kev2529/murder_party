"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePartyState } from "@/lib/usePoll";

type Lobby = {
  lobby: {
    code: string;
    scenario: { title: string; pitch: string; universe: string };
    cast: { id: string; name: string; publicPitch: string; claimedBy: string | null }[];
  };
};

function JoinFlow() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [confirmed, setConfirmed] = useState(!!params.get("code"));

  if (!confirmed) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-gold">Rejoindre une partie</h1>
        <p className="mt-2 text-zinc-400">Entrez le code donné par votre organisateur.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) setConfirmed(true);
          }}
          className="mt-8 flex gap-3"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BLOODY-742"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-lg tracking-widest placeholder-zinc-600 focus:border-gold focus:outline-none"
          />
          <button className="rounded-lg bg-gold px-5 font-semibold text-zinc-950 hover:bg-gold-bright">
            →
          </button>
        </form>
      </main>
    );
  }
  return <Lobby code={code.trim()} onBack={() => setConfirmed(false)} />;
}

function Lobby({ code, onBack }: { code: string; onBack: () => void }) {
  const router = useRouter();
  const { data, error } = usePartyState<Lobby>(code);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  if (error)
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={onBack} className="mt-4 text-gold underline">
          Réessayer avec un autre code
        </button>
      </main>
    );
  if (!data) return <main className="px-6 py-20 text-center text-zinc-500">Chargement…</main>;

  const { scenario, cast } = data.lobby;

  async function join() {
    setJoinError(null);
    const res = await fetch(`/api/parties/${code}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, characterId: selected }),
    });
    const json = await res.json();
    if (!res.ok) return setJoinError(json.error ?? "Erreur");
    localStorage.setItem(`ambre:${code.toUpperCase()}`, json.token);
    router.push(`/joueur/${code.toUpperCase()}`);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs uppercase tracking-widest text-gold/80">{scenario.universe}</p>
      <h1 className="font-display mt-1 text-3xl">{scenario.title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{scenario.pitch}</p>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-500">
        Choisissez votre personnage
      </h2>
      <div className="space-y-3">
        {cast.map((c) => (
          <button
            key={c.id}
            disabled={!!c.claimedBy}
            onClick={() => setSelected(c.id)}
            className={`w-full rounded-xl border p-4 text-left ${
              c.claimedBy
                ? "border-zinc-800 opacity-40"
                : selected === c.id
                  ? "border-gold bg-gold/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">{c.name}</span>
              {c.claimedBy && <span className="text-xs text-zinc-500">pris par {c.claimedBy}</span>}
            </div>
            <p className="mt-1 text-sm text-zinc-400">{c.publicPitch}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 placeholder-zinc-600 focus:border-gold focus:outline-none"
        />
        <button
          onClick={join}
          disabled={!selected || !name.trim()}
          className="whitespace-nowrap rounded-lg bg-gold px-5 font-semibold text-zinc-950 hover:bg-gold-bright disabled:opacity-40"
        >
          Rejoindre
        </button>
      </div>
      {joinError && <p className="mt-3 text-sm text-red-400">{joinError}</p>}
    </main>
  );
}

export default function RejoindrePage() {
  return (
    <Suspense>
      <JoinFlow />
    </Suspense>
  );
}
