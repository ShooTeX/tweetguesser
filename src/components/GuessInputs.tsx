import { type ChangeEventHandler, useState } from "react";
import type { KeyboardEventHandler } from "react";
import { findBestMatch } from "string-similarity";
import { gameConfigAtom } from "../atoms/game";
import { useAtom } from "jotai";

type GuessInputProps = {
  onCorrect: () => void;
  onIncorrect: () => void;
  onSkip: () => void;
  possibleAnswers: string[];
  disabled?: boolean;
};

type InputState = "default" | "error" | "correct";

export const GuessInput = ({
  onCorrect,
  onIncorrect,
  possibleAnswers,
  disabled,
  onSkip,
}: GuessInputProps) => {
  const [config] = useAtom(gameConfigAtom);
  const [inputState, setInputState] = useState<InputState>("default");
  const [input, setInput] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInputState("default");
    setInput(event.target.value);
  };

  const handleKeyEvent: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
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
    }

    if (event.key === "s" && event.ctrlKey) {
      onSkip();
    }
  };

  return (
    <input
      disabled={disabled}
      type="text"
      placeholder="Your Guess"
      className={`input w-full bg-neutral transition-all duration-100 ease-in-out ${
        inputState === "error" ? "input-error animate-wiggle" : ""
      }`}
      value={input}
      onChange={handleChange}
      onKeyDown={handleKeyEvent}
      autoFocus
    />
  );
};
