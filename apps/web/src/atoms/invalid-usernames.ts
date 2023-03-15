import { atom } from "jotai";
import { difference, intersection } from "remeda";
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
