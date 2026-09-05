import { Scenario } from "../engine/types";
import { manoirDelacroix } from "./manoir-delacroix";

export const scenarios: Record<string, Scenario> = {
  [manoirDelacroix.id]: manoirDelacroix,
};
