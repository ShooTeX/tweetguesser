import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const gameConfigAtom = atomWithReset({
  maxLives: 3,
  timeLimit: 30000,
  maxRounds: 10,
  similarityThreshold: 0.8,
});

const baseHighscoreAtom = atom(
  (typeof window !== "undefined" &&
    Number(localStorage.getItem("highscore"))) ??
    0
);

export const highScoreAtom = atom(
  (get) => get(baseHighscoreAtom),
  (get, set, value: number) => {
    const score = get(baseHighscoreAtom);
    if (score > value) {
      return;
    }

    set(baseHighscoreAtom, value);
    localStorage.setItem("highscore", value.toString());
  }
);

export type Round = {
  status: "pending" | "playing" | "done";
  possibleAnswers: string[];
  tries: number;
  score: number;
};

export const currentRoundAtom = atomWithReset<Round>({
  status: "pending",
  possibleAnswers: ["test", "asdf"],
  tries: 0,
  score: 0,
});

export const roundsAtom = atom<Round[]>([]);
