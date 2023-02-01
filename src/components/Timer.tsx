import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { gameConfigAtom } from "../atoms/game";

type TimerProps = {
  active: boolean;
};

export const Timer = ({ active }: TimerProps) => {
  const [timer, setTimer] = useState(0);
  const [config] = useAtom(gameConfigAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((timer) => timer + 1000);
    }, 1000);

    if (timer === config.timeLimit) {
      clearInterval(interval);
    }

    if (!active) {
      clearInterval(interval);
      setTimer(0);
    }

    return () => clearInterval(interval);
  }, [setTimer, config, timer, active]);

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
