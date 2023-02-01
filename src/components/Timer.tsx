import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { currentRoundAtom, gameConfigAtom } from "../atoms/game";

type TimerProps = {
  onTimesUp: () => void;
};

export const Timer = ({ onTimesUp }: TimerProps) => {
  const [timer, setTimer] = useState(0);
  const [round] = useAtom(currentRoundAtom);
  const [config] = useAtom(gameConfigAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((timer) => timer + 1000);
    }, 1000);

    if (timer === config.timeLimit) {
      clearInterval(interval);
      onTimesUp();
    }

    if (round.status !== "playing") {
      clearInterval(interval);
      setTimer(0);
    }

    return () => clearInterval(interval);
  }, [setTimer, config, timer, onTimesUp, round]);

  return (
    <progress
      className={`progress h-4 w-full ${
        config.timeLimit - 5000 > timer
          ? "progress-secondary"
          : "progress-error animate-bounce"
      }`}
      value={timer}
      max={config.timeLimit}
    ></progress>
  );
};
