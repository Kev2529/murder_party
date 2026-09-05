import { NextRequest, NextResponse } from "next/server";
import { scenarios } from "@/lib/scenarios";
import { validateScenario, castFor, createInitialState } from "@/lib/engine/engine";
import { newCode, newToken, saveParty } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { scenarioId, players } = await req.json();
  const raw = scenarios[scenarioId];
  if (!raw) return NextResponse.json({ error: "Scénario inconnu" }, { status: 404 });

  const { scenario, errors } = validateScenario(raw);
  if (!scenario) return NextResponse.json({ error: "Scénario invalide", details: errors }, { status: 500 });

  try {
    const castResult = castFor(scenario, players);
    const state = createInitialState(scenario, castResult);
    const party = {
      code: newCode(),
      scenarioId,
      playersCount: players,
      gmToken: newToken(),
      state,
      claimed: {},
      createdAt: Date.now(),
    };
    saveParty(party);
    return NextResponse.json({ code: party.code, gmToken: party.gmToken });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
