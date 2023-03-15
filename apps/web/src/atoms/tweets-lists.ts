import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { nanoid } from "nanoid";

type TweetsList = {
  id: string;
  name: string;
  tweetIds: string[];
};

const tweetsListsBaseAtom = atomWithStorage<TweetsList[]>("tweets-lists", [
  {
    id: "V1StGXR8_Z5jdHi6B-myT",
    name: "Sample list",
    tweetIds: [
      "1042219771930927104",
      "328386906775752705",
      "1018731670474670080",
      "838514592053538816",
      "1386339013037019139",
      "993720257373077504",
      "999149383038971904",
    ],
  },
]);

export const createTweetsListAtom = atom(
  undefined,
  (get, set, input: Omit<TweetsList, "id">) => {
    const list = get(tweetsListsBaseAtom);
    const newEntry = { id: nanoid(), ...input } satisfies TweetsList;
    set(tweetsListsBaseAtom, [...list, newEntry]);
  }
);

export const deleteTweetsListAtom = atom(
  undefined,
  (get, set, input: TweetsList["id"]) => {
    const list = get(tweetsListsBaseAtom);
    const entry = list.find((entry) => entry.id === input);

    if (!entry) {
      return;
    }

    set(
      tweetsListsBaseAtom,
      list.filter((entry) => entry.id !== input)
    );
  }
);

export const tweetsListsAtom = atom((get) => get(tweetsListsBaseAtom));
