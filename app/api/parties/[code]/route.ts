import { NextRequest, NextResponse } from "next/server";
import { getParty } from "@/lib/store";
import { gmView, playerView } from "@/lib/engine/engine";

// GET /api/parties/[code] — token via header "Authorization: Bearer …", jamais en URL.
// Sans token : infos publiques du lobby. Token MJ : vue MJ. Token joueur : vue joueur.
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const party = getParty(code);
  if (!party) return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });

  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const s = party.state.scenario;

  const lobby = {
    code: party.code,
    scenario: { title: s.title, pitch: s.pitch, universe: s.universe },
    playersCount: party.playersCount,
    cast: party.state.cast.map((id) => {
      const c = s.characters.find((ch) => ch.id === id)!;
      const claim = party.claimed[id];
      return { id, name: c.name, publicPitch: c.publicPitch, claimedBy: claim?.name ?? null };
    }),
    started: party.state.openedActs.length > 0,
  };

  if (!token) return NextResponse.json({ role: "lobby", lobby });

  if (token === party.gmToken) {
    return NextResponse.json({ role: "gm", lobby, view: gmView(party.state) });
  }

  const characterId = Object.entries(party.claimed).find(([, v]) => v.token === token)?.[0];
  if (!characterId) return NextResponse.json({ error: "Token invalide" }, { status: 403 });
  return NextResponse.json({
    role: "player",
    lobby,
    playerName: party.claimed[characterId].name,
    view: playerView(party.state, characterId),
  });
}
