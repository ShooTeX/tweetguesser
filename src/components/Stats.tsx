type StatsProps = {
  round: number;
  score: number;
};

export const Stats = ({ round, score }: StatsProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="stats shadow">
        <div className="stat w-48 place-items-center bg-neutral">
          <div className="stat-title">Score</div>
          <div className="stat-value text-primary">{score}</div>
        </div>
        <div className="stat w-32 place-items-center bg-neutral">
          <div className="stat-title">Round</div>
          <div className="stat-value">{round}</div>
        </div>
      </div>
    </div>
  );
};
