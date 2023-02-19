type StatsProperties = {
  round: number;
  score: number;
};

export const Stats = ({ round, score }: StatsProperties) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="stats shadow">
        <div className="stat bg-neutral w-48 place-items-center">
          <div className="stat-title">Score</div>
          <div className="stat-value text-primary font-mono">{score}</div>
        </div>
        <div className="stat bg-neutral w-32 place-items-center">
          <div className="stat-title">Round</div>
          <div className="stat-value font-mono">{round}</div>
        </div>
      </div>
    </div>
  );
};
