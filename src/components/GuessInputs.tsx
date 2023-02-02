import { useState } from "react";
import type { KeyboardEventHandler } from "react";
import { findBestMatch } from "string-similarity";
import { gameConfigAtom } from "../atoms/game";
import { useAtom } from "jotai";

type GuessInputProps = {
  onCorrect: () => void;
  onIncorrect: () => void;
  possibleAnswers: string[];
  disabled?: boolean;
};

export const GuessInput = ({
  onCorrect,
  onIncorrect,
  possibleAnswers,
  disabled,
}: GuessInputProps) => {
  const [config] = useAtom(gameConfigAtom);
  const [input, setInput] = useState("");

  const handleGuess: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    setInput("");

    const { bestMatch } = findBestMatch(
      input.toLowerCase(),
      possibleAnswers.map((value) => value.toLowerCase())
    );

    if (bestMatch.rating >= config.similarityThreshold) {
      onCorrect();
      return;
    }

    onIncorrect();
  };

  return (
    <input
      disabled={disabled}
      type="text"
      placeholder="Your Guess"
      className="input mr-4 flex-1 bg-neutral"
      value={input}
      onChange={(v) => setInput(v.target.value)}
      onKeyDown={handleGuess}
    />
  );
};
