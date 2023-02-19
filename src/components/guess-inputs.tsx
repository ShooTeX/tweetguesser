import {
  type ChangeEventHandler,
  useState,
  type FocusEventHandler,
  createRef,
  type MouseEvent,
} from "react";
import type { KeyboardEventHandler } from "react";
import { findBestMatch } from "string-similarity";
import { gameConfigAtom, usernamesAtom } from "../atoms/game";
import { useAtomValue } from "jotai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import clsx from "clsx";

type GuessInputProperties = {
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
}: GuessInputProperties) => {
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
      ? findBestMatch(previousInput || input, usernames)
          .ratings.sort((a, b) => b.rating - a.rating)
          .filter((suggestion) => suggestion.rating !== 0)
      : undefined;
  const inputField = createRef<HTMLInputElement>();

  if (
    showSuggestions &&
    selectedSuggestion !== undefined &&
    suggestions?.at(selectedSuggestion)?.target.toLowerCase() !==
      input.toLowerCase()
  ) {
    if (!previousInput) {
      setPreviousInput(input);
    }
    setInput(suggestions?.at(selectedSuggestion)?.target ?? "");
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setShowSuggestions(true);
    setSelectedSuggestion();
    setPreviousInput();
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
      setSelectedSuggestion();

      setInputState("error");
      onIncorrect();
    }

    if (event.key === "s" && event.ctrlKey) {
      event.preventDefault();
      onSkip();
    }

    if ((event.key === "Tab" && !event.shiftKey) || event.key === "ArrowUp") {
      event.preventDefault();
      setShowSuggestions(true);
      setSelectedSuggestion((index) => {
        if (!suggestions?.length) {
          return;
        }

        if (index === undefined || !suggestions.at(index + 1)) {
          return 0;
        }

        return index + 1;
      });
    }

    if ((event.key === "Tab" && event.shiftKey) || event.key === "ArrowDown") {
      event.preventDefault();
      setShowSuggestions(true);
      setSelectedSuggestion((index) => {
        if (!suggestions?.length) {
          return;
        }

        if (index === undefined || index <= 0 || !suggestions?.at(index - 1)) {
          return suggestions.length - 1;
        }

        return index - 1;
      });
    }

    if (event.key === "Escape") {
      if (selectedSuggestion !== undefined) {
        setSelectedSuggestion();
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

  const handleSuggestionClick = (
    event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>,
    index: number
  ) => {
    event.preventDefault();
    inputField.current?.focus();
    setSelectedSuggestion();
    setInput(suggestions?.at(index)?.target ?? "");
  };

  return (
    <div className="relative">
      {!disabled &&
        !!suggestions?.length &&
        input.length > 1 &&
        showSuggestions && (
          <ul
            className="bg-neutral absolute bottom-full z-10 mb-2 max-h-52 w-full overflow-y-auto overflow-x-hidden rounded-md p-2"
            ref={animationParent}
          >
            {suggestions.reverse().map((suggestion, index) => (
              <li
                className={clsx(
                  "hover:bg-primary-focus hover:text-primary-content cursor-pointer rounded p-2",
                  suggestions.length - 1 - index === selectedSuggestion &&
                    "bg-primary text-primary-content"
                )}
                key={suggestion.target}
                onPointerDown={(event) => handleSuggestionClick(event, index)}
              >
                {suggestion.target}
              </li>
            ))}
          </ul>
        )}
      <input
        ref={inputField}
        disabled={disabled}
        type="text"
        placeholder="Your Guess"
        className={`input bg-neutral w-full transition-all duration-100 ease-in-out ${
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
