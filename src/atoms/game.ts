import { atomWithStorage } from "jotai/utils";
import { z } from "zod";

const endTime = ["today", "1_month_ago", "1_year_ago", "3_years_ago"] as const;

export const endTimeSchema = z.enum(endTime);

export type EndTime = z.infer<typeof endTimeSchema>;

export type GameConfig = {
  timeLimit: number;
  similarityThreshold: number;
  endless: boolean;
  endTime: EndTime;
};

export const gameConfigAtom = atomWithStorage<GameConfig>("game-config", {
  timeLimit: 120000,
  similarityThreshold: 0.8,
  endless: false,
  endTime: "today",
});

export const usernamesAtom = atomWithStorage<string[]>("usernames", []);
