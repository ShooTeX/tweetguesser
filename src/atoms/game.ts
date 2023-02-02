import { atomWithReset } from "jotai/utils";

export const gameConfigAtom = atomWithReset({
  maxLives: 3,
  timeLimit: 30000,
  maxRounds: 10,
  similarityThreshold: 0.8,
});
