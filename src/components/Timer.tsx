import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { gameConfigAtom } from "../atoms/game";

type TimerProps = {
  onTimesUp: () => void;
  active?: boolean;
};

export const Timer = ({ onTimesUp, active }: TimerProps) => {
  const [timer, setTimer] = useState(0);
  const [config] = useAtom(gameConfigAtom);

  // FIXME: feels wrong
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((timer) => timer + 1000);
    }, 1000);

    if (timer === config.timeLimit) {
      console.log("onTimesUp");
      clearInterval(interval);
      setTimer(0);
      onTimesUp();
    }

    if (!active) {
      clearInterval(interval);
      setTimer(0);
    }

    return () => clearInterval(interval);
  }, [active, config.timeLimit, onTimesUp, timer]);

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
