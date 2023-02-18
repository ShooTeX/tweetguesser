import { atomWithStorage } from "jotai/utils";

export type GameConfig = {
  timeLimit: number;
  similarityThreshold: number;
  endless: boolean;
  startTime: "today" | "1_month_ago" | "1_year_ago" | "3_years_ago";
};

export const gameConfigAtom = atomWithStorage<GameConfig>("game-config", {
  timeLimit: 120000,
  similarityThreshold: 0.8,
  endless: false,
  startTime: "today",
});

export const usernamesAtom = atomWithStorage<string[]>("usernames", []);
