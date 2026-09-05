import { scenarios } from "@/lib/scenarios";
import { LandingFlow } from "./LandingFlow";

export default function Home() {
  const list = Object.values(scenarios).map((s) => ({
    id: s.id,
    title: s.title,
    pitch: s.pitch,
    universe: s.universe,
    minPlayers: s.minPlayers,
    maxPlayers: s.maxPlayers,
  }));
  return <LandingFlow scenarios={list} />;
}
