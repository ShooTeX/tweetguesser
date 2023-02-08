import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

const baseGameConfigAtom = atomWithReset({
  maxLives: 3,
  pointsPerLive: 5,
  timeLimit: 30000,
  maxRounds: 10,
  similarityThreshold: 0.8,
  endless: true,
});

export const gameConfigAtom = atom((get) => get(baseGameConfigAtom));

export const endlessModeAtom = atom(null, (_get, set, newValue: boolean) => {
  set(baseGameConfigAtom, (prev) => ({
    ...prev,
    endless: newValue,
    maxLives: -1,
    timeLimit: -1,
    maxRounds: -1,
  }));
});
