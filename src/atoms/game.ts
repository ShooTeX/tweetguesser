import { atomWithStorage } from "jotai/utils";

export const gameConfigAtom = atomWithStorage("game_config", {
  timeLimit: 120000,
  similarityThreshold: 0.8,
  endless: false,
});

export const usernamesAtom = atomWithStorage<string[]>("usernames", []);
