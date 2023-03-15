import { atom } from "jotai";
import { clone, difference, intersection } from "remeda";
import type { EndTime } from "./game";
import { gameConfigAtom } from "./game";
import { usernamesAtom } from "./game";

const forbiddenUsernamesCacheAtom = atom<string[]>([]);

export const addForbiddenUsernamesCacheAtom = atom(
  undefined,
  (get, set, input: string[]) => {
    const cache = get(forbiddenUsernamesCacheAtom);
    const lowercaseInput = input.map((string) => string.toLowerCase());
    const newUsernames = difference(lowercaseInput, cache);

    if (newUsernames.length === 0) {
      return;
    }

    set(forbiddenUsernamesCacheAtom, [...cache, ...newUsernames]);
  }
);

export const cachedForbiddenUsernamesAtom = atom((get) =>
  get(forbiddenUsernamesCacheAtom)
);

export const currentForbiddenUsernamesAtom = atom((get) =>
  intersection(get(forbiddenUsernamesCacheAtom), get(usernamesAtom))
);

const emptyUsernamesCacheAtom = atom<Record<EndTime, string[]>>({
  today: [],
  "1_month_ago": [],
  "3_months_ago": [],
  "6_months_ago": [],
} satisfies Record<EndTime, string[]>);

export const addEmptyUsernamesCacheAtom = atom(
  undefined,
  (get, set, input: string[]) => {
    const cache = clone(get(emptyUsernamesCacheAtom));
    const { endTime } = get(gameConfigAtom);
    const lowercaseInput = input.map((string) => string.toLowerCase());
    const newUsernames = difference(lowercaseInput, cache[endTime]);

    if (newUsernames.length === 0) {
      return;
    }

    cache[endTime] = [...cache[endTime], ...newUsernames];

    set(emptyUsernamesCacheAtom, cache);
  }
);

export const currentEmptyUsernamesAtom = atom((get) => {
  const { endTime } = get(gameConfigAtom);
  const cache = get(emptyUsernamesCacheAtom);
  const usernames = get(usernamesAtom);
  return intersection(cache[endTime], usernames);
});
