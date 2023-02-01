import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const gameConfigAtom = atomWithReset({
  maxLives: 3,
  timeLimit: 30,
  maxRounds: 10,
});

const baseHighscoreAtom = atom(Number(localStorage.getItem("highscore")) ?? 0);

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
};

export const currentRoundAtom = atomWithReset<Round>({
  status: "pending",
  possibleAnswers: [],
  tries: 0,
});

export const roundsAtoms = atom<Round[]>([]);
