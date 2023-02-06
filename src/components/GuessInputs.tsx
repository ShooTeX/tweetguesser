import { ChangeEventHandler, useState } from "react";
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

type InputState = "default" | "error" | "correct";

export const GuessInput = ({
  onCorrect,
  onIncorrect,
  possibleAnswers,
  disabled,
}: GuessInputProps) => {
  const [config] = useAtom(gameConfigAtom);
  const [inputState, setInputState] = useState<InputState>("default");
  const [input, setInput] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInputState("default");
    setInput(event.target.value);
  };

  const handleGuess: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const { bestMatch } = findBestMatch(
      input.toLowerCase(),
      possibleAnswers.map((value) => value.toLowerCase())
    );

    if (bestMatch.rating >= config.similarityThreshold) {
      setInputState("correct");
      onCorrect();
      return;
    }

    setInput("");

    setInputState("error");
    onIncorrect();
  };

  return (
    <input
      disabled={disabled}
      type="text"
      placeholder="Your Guess"
      className={`input mr-4 flex-1 bg-neutral transition-all duration-100 ease-in-out ${
        inputState === "error" ? "input-error animate-wiggle" : ""
      }`}
      value={input}
      onChange={handleChange}
      onKeyDown={handleGuess}
      autoFocus
    />
  );
};
