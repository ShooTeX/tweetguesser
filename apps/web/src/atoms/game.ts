import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { splitAt } from "remeda";
import { z } from "zod";

const endTime = [
  "today",
  "1_month_ago",
  "3_months_ago",
  "6_months_ago",
] as const;

export const endTimeSchema = z.enum(endTime);

const gameModes = ["handles", "tweets"] as const;

export type EndTime = z.infer<typeof endTimeSchema>;

export const gameModeSchema = z.enum(gameModes);

export type GameMode = z.input<typeof gameModeSchema>;

// TODO: make this a schema
export type GameConfig = {
  timeLimit: number;
  similarityThreshold: number;
  endless: boolean;
  endTime: EndTime;
  gameMode: GameMode;
  hideUrls: boolean;
};

export const gameConfigAtom = atomWithStorage<GameConfig>("game-config", {
  timeLimit: 120_000,
  similarityThreshold: 0.9,
  endless: false,
  endTime: "today",
  gameMode: "handles",
  hideUrls: false,
});

const usernamesBaseAtom = atomWithStorage<string[]>("usernames", []);

export const usernamesAtom = atom(
  (get) => get(usernamesBaseAtom),
  (_get, set, newValue: string[]) =>
    set(
      usernamesBaseAtom,
      splitAt(newValue, 20)[0].map((value) => value.toLowerCase())
    )
);

export const tweetIdsAtom = atomWithStorage<string[]>("tweet-ids", []);
