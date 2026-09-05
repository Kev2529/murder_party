import { randomBytes } from "crypto";
import { GameState } from "./engine/types";

export type Party = {
  code: string;
  scenarioId: string;
  playersCount: number;
  gmToken: string;
  state: GameState;
  // characterId -> joueur l'ayant réclamé
  claimed: Record<string, { name: string; token: string }>;
  createdAt: number;
};

// POC : état en mémoire, survit au HMR de Next via globalThis.
const g = globalThis as unknown as { __parties?: Map<string, Party> };
const parties = (g.__parties ??= new Map<string, Party>());

const WORDS = ["BLOODY", "RAVEN", "OPIUM", "VELVET", "CRIMSON", "SHADOW", "AMBRE", "NOIR"];

export function newCode(): string {
  let code: string;
  do {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    // 4 chiffres (1000-9999) : espace plus large, décourage l'énumération
    // du code (défense en profondeur, en plus du rate-limit sur /join et GET).
    code = `${word}-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (parties.has(code));
  return code;
}

export const newToken = () => randomBytes(16).toString("hex");

export const saveParty = (p: Party) => parties.set(p.code, p);
export const getParty = (code: string) => parties.get(code.toUpperCase().trim());
