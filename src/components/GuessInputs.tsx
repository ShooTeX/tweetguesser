import { type ChangeEventHandler, useState, FocusEventHandler } from "react";
import type { KeyboardEventHandler } from "react";
import { findBestMatch } from "string-similarity";
import { gameConfigAtom, usernamesAtom } from "../atoms/game";
import { useAtomValue } from "jotai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import clsx from "clsx";

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
  const [animationParent] = useAutoAnimate();
  const config = useAtomValue(gameConfigAtom);
  const usernames = useAtomValue(usernamesAtom);
  const [inputState, setInputState] = useState<InputState>("default");
  const [input, setInput] = useState("");
  const [previousInput, setPreviousInput] = useState<string>();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>();
  const suggestions =
    input && usernames
      ? findBestMatch(input, usernames)
          .ratings.sort((a, b) => b.rating - a.rating)
          .filter((suggestion) => suggestion.rating !== 0)
      : undefined;

  if (
    showSuggestions &&
    selectedSuggestion !== undefined &&
    suggestions?.at(selectedSuggestion)?.target.toLowerCase() !==
      input.toLowerCase()
  ) {
    setPreviousInput(input);
    setInput(suggestions?.at(selectedSuggestion)?.target ?? "");
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setShowSuggestions(true);
    setSelectedSuggestion(undefined);
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
      setShowSuggestions(false);
      setSelectedSuggestion(undefined);

      setInputState("error");
      onIncorrect();
    }

    if (event.key === "s" && event.ctrlKey) {
      event.preventDefault();
      onSkip();
    }

    if (event.key === "Tab") {
      event.preventDefault();
      setShowSuggestions(true);
      setSelectedSuggestion((index) => {
        if (!suggestions?.length) {
          return undefined;
        }

        if (!index || !suggestions.at(index + 1)) {
          return 0;
        }

        return index + 1;
      });
    }

    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      setShowSuggestions(true);
      setSelectedSuggestion((index) => {
        if (!suggestions?.length) {
          return undefined;
        }

        if (!index || !suggestions?.at(index - 1)) {
          return suggestions.length - 1;
        }

        return index - 1;
      });
    }

    if (event.key === "Escape") {
      if (selectedSuggestion !== undefined) {
        setSelectedSuggestion(undefined);
        setInput(previousInput ?? "");
        return;
      }
      setShowSuggestions(false);
    }
  };

  const handleBlurEvent: FocusEventHandler<HTMLInputElement> = () => {
    setShowSuggestions(false);
  };

  const handleFocusEvent: FocusEventHandler<HTMLInputElement> = () => {
    setShowSuggestions(true);
  };

  return (
    <div className="relative">
      {!disabled &&
        !!suggestions?.length &&
        input.length > 1 &&
        showSuggestions && (
          <ul
            className="absolute bottom-full z-10 mb-2 max-h-52 w-full overflow-y-auto rounded-md bg-neutral px-2 py-2"
            ref={animationParent}
          >
            {suggestions.map((suggestion, i) => (
              <li
                className={clsx(
                  "cursor-pointer rounded py-2 px-2 hover:bg-primary-focus hover:text-primary-content",
                  i === selectedSuggestion && "bg-primary text-primary-content"
                )}
                key={suggestion.target}
              >
                {suggestion.target}
              </li>
            ))}
          </ul>
        )}
      <input
        disabled={disabled}
        type="text"
        placeholder="Your Guess"
        className={`input w-full bg-neutral transition-all duration-100 ease-in-out ${
          inputState === "error" ? "input-error animate-wiggle" : ""
        }`}
        value={input}
        onChange={handleChange}
        onBlur={handleBlurEvent}
        onFocus={handleFocusEvent}
        onKeyDown={handleKeyEvent}
        autoFocus
      />
    </div>
  );
};
