import { useAtom } from "jotai";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { currentRoundAtom, gameConfigAtom } from "../atoms/game";

export const GuessInput = () => {
  const [config] = useAtom(gameConfigAtom);
  const [round] = useAtom(currentRoundAtom);

  return (
    <div className="flex w-[598px] items-center py-4">
      <input
        type="text"
        placeholder="Your Guess"
        className="input mr-4 flex-1 bg-neutral"
      />
      <div className="flex space-x-1 text-lg">
        {[...Array<undefined>(config.maxLives - round.tries)].map((_, i) => (
          <FaHeart className="text-success" key={`heart-${i}`} />
        ))}
        {[...Array<undefined>(round.tries)].map((_, i) => (
          <FaHeartBroken className="text-error" key={`fail-${i}`} />
        ))}
      </div>
    </div>
  );
};
