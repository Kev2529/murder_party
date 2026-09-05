import { NextRequest, NextResponse } from "next/server";
import { getParty } from "@/lib/store";
import { applyAction } from "@/lib/engine/engine";
import { ActionSchema } from "@/lib/engine/types";

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const party = getParty(code);
  if (!party) return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });

  const { token, action: rawAction } = await req.json();
  if (token !== party.gmToken) return NextResponse.json({ error: "Réservé au MJ" }, { status: 403 });

  const parsed = ActionSchema.safeParse(rawAction);
  if (!parsed.success) return NextResponse.json({ error: "Action invalide" }, { status: 400 });

  try {
    party.state = applyAction(party.state, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
