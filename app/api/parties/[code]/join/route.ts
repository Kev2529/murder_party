import { NextRequest, NextResponse } from "next/server";
import { getParty, newToken } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  if (!rateLimit(req, "join", 20, 60_000))
    return NextResponse.json({ error: "Trop de tentatives, réessayez dans un instant" }, { status: 429 });

  const { code } = await ctx.params;
  const party = getParty(code);
  if (!party) return NextResponse.json({ error: "Partie introuvable" }, { status: 404 });

  const { name, characterId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  if (!party.state.cast.includes(characterId))
    return NextResponse.json({ error: "Personnage hors distribution" }, { status: 400 });
  if (party.claimed[characterId])
    return NextResponse.json({ error: "Personnage déjà pris" }, { status: 409 });

  const token = newToken();
  party.claimed[characterId] = { name: name.trim(), token };
  return NextResponse.json({ token, characterId });
}
