import {
  Scenario,
  ScenarioSchema,
  Action,
  GameState,
  CastResult,
  Redistribution,
  LogEntry,
} from "./types";

// ---------- Validation ----------

export function validateScenario(json: unknown): { scenario?: Scenario; errors: string[] } {
  const parsed = ScenarioSchema.safeParse(json);
  if (!parsed.success) {
    return { errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  }
  const s = parsed.data;
  const errors: string[] = [];
  const charIds = new Set(s.characters.map((c) => c.id));
  const actIds = new Set(s.acts.map((a) => a.id));
  const infoIds = new Set(s.infos.map((i) => i.id));
  const clueIds = new Set(s.clues.map((c) => c.id));

  const checkChar = (id: string, ctx: string) => {
    if (id !== "all" && !charIds.has(id)) errors.push(`${ctx}: personnage inconnu "${id}"`);
  };

  for (const r of s.relationships) {
    checkChar(r.a, "relation");
    checkChar(r.b, "relation");
  }
  for (const i of s.infos) {
    i.carriers.forEach((c) => checkChar(c, `info ${i.id}`));
    if (i.fallback?.type === "character") checkChar(i.fallback.characterId, `fallback de ${i.id}`);
    const allOptional = i.carriers.every(
      (c) => !s.characters.find((ch) => ch.id === c)?.required
    );
    if (i.essential && allOptional && !i.fallback)
      errors.push(`info essentielle "${i.id}" portée uniquement par des optionnels, sans fallback`);
  }
  for (const c of s.clues) {
    if (c.holder) checkChar(c.holder, `indice ${c.id}`);
    if (c.actId && !actIds.has(c.actId)) errors.push(`indice ${c.id}: acte inconnu "${c.actId}"`);
  }
  const checkEffects = (effects: { type: string; infoId?: string; clueId?: string; to?: string }[], ctx: string) => {
    for (const e of effects) {
      if (e.type === "revealInfo" && !infoIds.has(e.infoId!)) errors.push(`${ctx}: info inconnue "${e.infoId}"`);
      if (e.type === "giveClue" && !clueIds.has(e.clueId!)) errors.push(`${ctx}: indice inconnu "${e.clueId}"`);
      if (e.to) checkChar(e.to, ctx);
    }
  };
  for (const ev of s.events) {
    if (ev.actId && !actIds.has(ev.actId)) errors.push(`événement ${ev.id}: acte inconnu "${ev.actId}"`);
    checkEffects(ev.effects, `événement ${ev.id}`);
  }
  for (const a of s.acts) checkEffects(a.effects, `acte ${a.id}`);

  const required = s.characters.filter((c) => c.required).length;
  if (s.minPlayers < required)
    errors.push(`minPlayers (${s.minPlayers}) < nombre de personnages obligatoires (${required})`);
  if (s.maxPlayers > s.characters.length)
    errors.push(`maxPlayers (${s.maxPlayers}) > nombre de personnages (${s.characters.length})`);

  return errors.length ? { errors } : { scenario: s, errors: [] };
}

// ---------- Composition selon le nombre de joueurs ----------

export function castFor(scenario: Scenario, players: number): CastResult {
  if (players < scenario.minPlayers || players > scenario.maxPlayers)
    throw new Error(`Ce scénario se joue de ${scenario.minPlayers} à ${scenario.maxPlayers} joueurs.`);

  const required = scenario.characters.filter((c) => c.required).map((c) => c.id);
  const optionals = scenario.characters
    .filter((c) => !c.required)
    .sort((a, b) => a.priority - b.priority)
    .map((c) => c.id);
  const cast = [...required, ...optionals.slice(0, players - required.length)];
  const castSet = new Set(cast);

  const redistributions: Redistribution[] = [];
  for (const info of scenario.infos) {
    if (!info.essential) continue;
    if (info.carriers.some((c) => castSet.has(c))) continue; // au moins un porteur présent
    const absent = info.carriers[0] ?? "?";
    const fb = info.fallback;
    if (fb?.type === "character" && castSet.has(fb.characterId)) {
      redistributions.push({ infoId: info.id, from: absent, to: fb });
    } else {
      redistributions.push({ infoId: info.id, from: absent, to: { type: "gm" } });
    }
  }
  return { cast, redistributions };
}

// ---------- État initial ----------

export function createInitialState(scenario: Scenario, castResult: CastResult): GameState {
  const knownInfos: Record<string, string[]> = {};
  const heldClues: Record<string, string[]> = {};
  for (const id of castResult.cast) {
    knownInfos[id] = scenario.infos.filter((i) => i.carriers.includes(id)).map((i) => i.id);
    heldClues[id] = scenario.clues.filter((c) => c.holder === id).map((c) => c.id);
  }
  for (const r of castResult.redistributions) {
    if (r.to.type === "character") knownInfos[r.to.characterId].push(r.infoId);
  }
  return {
    scenario,
    cast: castResult.cast,
    redistributions: castResult.redistributions,
    knownInfos,
    heldClues,
    announcements: [],
    openedActs: [],
    triggeredEvents: [],
    journal: [],
  };
}

// ---------- Application des actions du MJ ----------

type Effect = Scenario["events"][number]["effects"][number];

function applyEffects(state: GameState, effects: Effect[]) {
  for (const e of effects) {
    if (e.type === "announce") {
      state.announcements.push({ at: Date.now(), text: e.text });
    } else if (e.type === "revealInfo") {
      const targets = e.to === "all" ? state.cast : [e.to];
      for (const t of targets) {
        if (state.knownInfos[t] && !state.knownInfos[t].includes(e.infoId))
          state.knownInfos[t].push(e.infoId);
      }
    } else if (e.type === "giveClue") {
      const targets = e.to === "all" ? state.cast : [e.to];
      for (const t of targets) {
        if (state.heldClues[t] && !state.heldClues[t].includes(e.clueId))
          state.heldClues[t].push(e.clueId);
      }
    }
  }
}

export function applyAction(state: GameState, action: Action): GameState {
  const s: GameState = structuredClone(state);
  const name = (id: string) =>
    id === "all" ? "tous" : s.scenario.characters.find((c) => c.id === id)?.name ?? id;
  let summary = "";

  switch (action.type) {
    case "openAct": {
      const act = s.scenario.acts.find((a) => a.id === action.actId);
      if (!act) throw new Error(`Acte inconnu: ${action.actId}`);
      if (s.openedActs.includes(act.id)) throw new Error(`Acte déjà ouvert: ${act.id}`);
      s.openedActs.push(act.id);
      s.announcements.push({ at: Date.now(), text: `— ${act.title} —\n${act.intro}` });
      applyEffects(s, act.effects);
      summary = `Acte ouvert : ${act.title}`;
      break;
    }
    case "triggerEvent": {
      const ev = s.scenario.events.find((e) => e.id === action.eventId);
      if (!ev) throw new Error(`Événement inconnu: ${action.eventId}`);
      if (s.triggeredEvents.includes(ev.id)) throw new Error(`Événement déjà déclenché: ${ev.id}`);
      s.triggeredEvents.push(ev.id);
      applyEffects(s, ev.effects);
      summary = `Événement déclenché : ${ev.label}`;
      break;
    }
    case "giveClue": {
      applyEffects(s, [{ type: "giveClue", clueId: action.clueId, to: action.to }]);
      const clue = s.scenario.clues.find((c) => c.id === action.clueId);
      summary = `Indice « ${clue?.label} » remis à ${name(action.to)}`;
      break;
    }
    case "revealInfo": {
      applyEffects(s, [{ type: "revealInfo", infoId: action.infoId, to: action.to }]);
      const info = s.scenario.infos.find((i) => i.id === action.infoId);
      summary = `Info « ${info?.label} » révélée à ${name(action.to)}`;
      break;
    }
    case "announce": {
      applyEffects(s, [{ type: "announce", text: action.text }]);
      summary = `Annonce : ${action.text.slice(0, 60)}`;
      break;
    }
  }
  const entry: LogEntry = { at: Date.now(), action, summary };
  s.journal.push(entry);
  return s;
}

// ---------- Vues dérivées ----------

export function playerView(state: GameState, characterId: string) {
  const s = state.scenario;
  const me = s.characters.find((c) => c.id === characterId);
  if (!me || !state.cast.includes(characterId)) throw new Error("Personnage hors distribution");
  const known = new Set(state.knownInfos[characterId] ?? []);
  const held = new Set(state.heldClues[characterId] ?? []);
  const castSet = new Set(state.cast);

  return {
    character: { id: me.id, name: me.name, publicPitch: me.publicPitch, privateSheet: me.privateSheet },
    objectives: s.infos.filter((i) => i.isObjective && known.has(i.id)),
    secrets: s.infos.filter((i) => i.isSecret && known.has(i.id)),
    infos: s.infos.filter((i) => known.has(i.id) && !i.isSecret && !i.isObjective),
    clues: s.clues.filter((c) => held.has(c.id)),
    relationships: s.relationships
      .filter((r) => (r.a === characterId && castSet.has(r.b)) || (r.b === characterId && castSet.has(r.a)))
      .map((r) => {
        const otherId = r.a === characterId ? r.b : r.a;
        const other = s.characters.find((c) => c.id === otherId)!;
        return { with: other.name, know: r.a === characterId ? r.aKnows : r.bKnows };
      }),
    others: s.characters
      .filter((c) => castSet.has(c.id) && c.id !== characterId)
      .map((c) => ({ id: c.id, name: c.name, publicPitch: c.publicPitch })),
    announcements: state.announcements,
    currentAct: state.openedActs.length
      ? s.acts.find((a) => a.id === state.openedActs[state.openedActs.length - 1])?.title
      : null,
  };
}

export function gmView(state: GameState) {
  const s = state.scenario;
  const castSet = new Set(state.cast);
  return {
    scenario: { title: s.title, pitch: s.pitch, solution: s.solution, timeline: s.timeline },
    acts: s.acts.map((a) => ({
      ...a,
      opened: state.openedActs.includes(a.id),
      events: s.events
        .filter((e) => e.actId === a.id)
        .map((e) => ({ ...e, triggered: state.triggeredEvents.includes(e.id) })),
      clues: s.clues.filter((c) => c.actId === a.id),
    })),
    looseEvents: s.events
      .filter((e) => !e.actId)
      .map((e) => ({ ...e, triggered: state.triggeredEvents.includes(e.id) })),
    characters: s.characters
      .filter((c) => castSet.has(c.id))
      .map((c) => ({
        ...c,
        knownInfos: (state.knownInfos[c.id] ?? []).map((id) => s.infos.find((i) => i.id === id)!),
        heldClues: (state.heldClues[c.id] ?? []).map((id) => s.clues.find((cl) => cl.id === id)!),
      })),
    infos: s.infos,
    clues: s.clues.map((c) => ({
      ...c,
      distributedTo: state.cast.filter((id) => (state.heldClues[id] ?? []).includes(c.id)),
    })),
    gmDuties: state.redistributions
      .filter((r) => r.to.type === "gm")
      .map((r) => ({
        info: s.infos.find((i) => i.id === r.infoId)!,
        from: s.characters.find((c) => c.id === r.from)?.name ?? r.from,
      })),
    redistributions: state.redistributions,
    announcements: state.announcements,
    journal: state.journal,
  };
}
