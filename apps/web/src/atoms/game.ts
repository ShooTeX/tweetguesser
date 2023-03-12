import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
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

export type GameConfig = {
  timeLimit: number;
  similarityThreshold: number;
  endless: boolean;
  endTime: EndTime;
  gameMode: GameMode;
};

export const gameConfigAtom = atomWithStorage<GameConfig>("game-config", {
  timeLimit: 120_000,
  similarityThreshold: 0.8,
  endless: false,
  endTime: "today",
  gameMode: "handles",
});

export const usernamesAtom = atomWithStorage<string[]>("usernames", []);

export const tweetIdsAtom = atomWithStorage<string[]>("tweet-ids", []);

const invalidUsernamesBaseAtom = atom<string[]>([]);

export const invalidUsernamesAtom = atom((get) =>
  get(invalidUsernamesBaseAtom)
);

export const addInvalidUsernamesAtom = atom(
  undefined,
  (get, set, input: string[]) => {
    const invalidUsernames = get(invalidUsernamesBaseAtom);
    const newInvalidUsernames = input.filter(
      (username) => !invalidUsernames.includes(username)
    );

    console.log(invalidUsernames, newInvalidUsernames);

    if (newInvalidUsernames.length === 0) {
      return;
    }

    set(invalidUsernamesBaseAtom, [
      ...invalidUsernames,
      ...newInvalidUsernames,
    ]);
  }
);
