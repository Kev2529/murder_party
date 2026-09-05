import { z } from "zod";

// ---------- Schéma du scénario ----------

const Effect = z.discriminatedUnion("type", [
  z.object({ type: z.literal("revealInfo"), infoId: z.string(), to: z.string() }), // characterId ou "all"
  z.object({ type: z.literal("giveClue"), clueId: z.string(), to: z.string() }),
  z.object({ type: z.literal("announce"), text: z.string() }),
]);

const Fallback = z.discriminatedUnion("type", [
  z.object({ type: z.literal("character"), characterId: z.string() }),
  z.object({ type: z.literal("gm") }),
]);

export const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.string(),
  universe: z.string(),
  pitch: z.string(),
  minPlayers: z.number().int().min(2),
  maxPlayers: z.number().int(),
  acts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      intro: z.string(), // diffusé à tous à l'ouverture de l'acte
      gmInstructions: z.string(),
      effects: z.array(Effect).default([]), // appliqués à l'ouverture
    })
  ),
  characters: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      publicPitch: z.string(), // ce que les autres voient
      privateSheet: z.string(), // fiche privée du joueur
      required: z.boolean(),
      priority: z.number().int().default(0), // ordre d'ajout des optionnels
    })
  ),
  relationships: z.array(
    z.object({
      a: z.string(),
      b: z.string(),
      aKnows: z.string(), // ce que A sait de ce lien
      bKnows: z.string(),
    })
  ),
  infos: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      content: z.string(),
      carriers: z.array(z.string()), // characterIds qui la connaissent au départ
      essential: z.boolean(),
      fallback: Fallback.optional(), // requis si essential et portée par des optionnels
      isSecret: z.boolean().default(false), // secret personnel du porteur
      isObjective: z.boolean().default(false), // objectif du porteur
    })
  ),
  clues: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["indice", "objet", "document"]),
      label: z.string(),
      content: z.string(),
      holder: z.string().optional(), // characterId, sinon réserve MJ
      actId: z.string().optional(), // acte où il est censé sortir
    })
  ),
  events: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
      gmInstructions: z.string(),
      actId: z.string().optional(),
      effects: z.array(Effect).default([]),
    })
  ),
  timeline: z.array(z.object({ time: z.string(), fact: z.string() })), // MJ uniquement
  solution: z.string(), // MJ uniquement
});

export type Scenario = z.infer<typeof ScenarioSchema>;
export type Character = Scenario["characters"][number];
export type Info = Scenario["infos"][number];
export type Clue = Scenario["clues"][number];
export type GameEvent = Scenario["events"][number];

// ---------- Actions du MJ ----------

export const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("openAct"), actId: z.string() }),
  z.object({ type: z.literal("triggerEvent"), eventId: z.string() }),
  z.object({ type: z.literal("giveClue"), clueId: z.string(), to: z.string() }),
  z.object({ type: z.literal("revealInfo"), infoId: z.string(), to: z.string() }),
  z.object({ type: z.literal("announce"), text: z.string().min(1).max(500) }),
]);

export type Action = z.infer<typeof ActionSchema>;

export type LogEntry = { at: number; action: Action; summary: string };

// ---------- État de partie ----------

export type Redistribution = {
  infoId: string;
  from: string; // personnage absent
  to: { type: "character"; characterId: string } | { type: "gm" };
};

export type CastResult = {
  cast: string[]; // characterIds retenus
  redistributions: Redistribution[];
};

export type GameState = {
  scenario: Scenario;
  cast: string[];
  redistributions: Redistribution[];
  // characterId -> infos connues / indices détenus
  knownInfos: Record<string, string[]>;
  heldClues: Record<string, string[]>;
  announcements: { at: number; text: string }[];
  openedActs: string[];
  triggeredEvents: string[];
  journal: LogEntry[];
};
