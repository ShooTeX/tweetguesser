import { atomWithReset } from "jotai/utils";

export const gameConfigAtom = atomWithReset({
  timeLimit: 120000,
  similarityThreshold: 0.8,
});
