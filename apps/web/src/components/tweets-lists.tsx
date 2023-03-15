import { useAtomValue, useSetAtom } from "jotai";
import { Trash } from "lucide-react";
import type { MouseEvent } from "react";
import { tweetIdsAtom } from "../atoms/game";
import { deleteTweetsListAtom, tweetsListsAtom } from "../atoms/tweets-lists";

export const TweetsLists = () => {
  const tweetsLists = useAtomValue(tweetsListsAtom);
  const deleteTweetsList = useSetAtom(deleteTweetsListAtom);
  const setTweetIds = useSetAtom(tweetIdsAtom);

  const handleListClick = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    id: string
  ) => {
    event.stopPropagation();
    deleteTweetsList(id);
  };

  return (
    <div className="overflow-x-auto drop-shadow-md">
      <table className="table-compact table-zebra table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tweetsLists.map((list, index) => (
            <tr
              className="hover cursor-pointer"
              key={list.id}
              onClick={() => setTweetIds(list.tweetIds)}
            >
              <th>{index + 1}</th>
              <td>{list.name}</td>
              <td className="flex justify-end">
                <button
                  className="btn btn-ghost btn-circle btn-xs"
                  onClick={(event) => handleListClick(event, list.id)}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
