import { useAtom } from "jotai";
import { gameConfigAtom } from "../atoms/game";
import { Round } from "../types/round";

type StatsProps = {
  rounds: Round[];
  highscore?: number;
};

export const Stats = ({ rounds, highscore = 0 }: StatsProps) => {
  const [config] = useAtom(gameConfigAtom);
  const score = rounds.reduce((prev, round) => prev + round.score, 0);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="stats shadow">
        <div className="stat w-48 place-items-center bg-neutral">
          <div className="stat-title">Score</div>
          <div className="stat-value text-primary">{score}</div>
        </div>
        <div className="stat w-32 place-items-center bg-neutral">
          <div className="stat-title">Round</div>
          <div className="stat-value">{rounds.length + 1}</div>
        </div>
        <div className="stat place-items-center bg-neutral">
          <div className="stat-title">Highscore</div>
          <div className="stat-value">{highscore}</div>
        </div>
      </div>
      <ul className="steps mt-4">
        {rounds.map(({ score }, i) => (
          <li
            data-content={score}
            key={`round-${i}`}
            className={`step ${score > 0 ? "step-success" : "step-error"}`}
          ></li>
        ))}
        {[...Array<unknown>(config.maxRounds - rounds.length)].map((_v, i) => (
          <li data-content="" key={`round-${i}`} className="step"></li>
        ))}
      </ul>
    </div>
  );
};
