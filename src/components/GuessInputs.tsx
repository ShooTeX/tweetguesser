import { useAtom } from "jotai";
import { useState } from "react";
import type { KeyboardEventHandler } from "react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { currentRoundAtom, gameConfigAtom } from "../atoms/game";
import { findBestMatch } from "string-similarity";

export const GuessInput = () => {
  const [config] = useAtom(gameConfigAtom);
  const [round] = useAtom(currentRoundAtom);
  const [input, setInput] = useState("");

  const handleGuess: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const { bestMatch } = findBestMatch(input, round.possibleAnswers);

    if (bestMatch.rating >= config.similarityThreshold) {
      console.log("HIT!");
    }
  };

  return (
    <div className="flex w-[598px] items-center py-4">
      <input
        type="text"
        placeholder="Your Guess"
        className="input mr-4 flex-1 bg-neutral"
        value={input}
        onChange={(v) => setInput(v.target.value)}
        onKeyDown={handleGuess}
      />
      <div className="flex space-x-1 text-lg">
        {[...Array<undefined>(config.maxLives - round.tries)].map((_, i) => (
          <FaHeart className="text-success" key={`heart-${i}`} />
        ))}
        {[...Array<undefined>(round.tries)].map((_, i) => (
          <FaHeartBroken className="text-error" key={`fail-${i}`} />
        ))}
      </div>
    </div>
  );
};
