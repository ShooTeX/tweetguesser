import { useAtom } from "jotai";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { gameConfigAtom } from "../atoms/game";

type LivesProps = {
  tries: number;
};

export const Lives = ({ tries }: LivesProps) => {
  const [config] = useAtom(gameConfigAtom);

  return (
    <div className="flex space-x-1 text-lg">
      {[...Array<undefined>(config.maxLives - tries)].map((_, i) => (
        <FaHeart className="text-success" key={`heart-${i}`} />
      ))}
      {[...Array<undefined>(tries)].map((_, i) => (
        <FaHeartBroken className="text-error" key={`fail-${i}`} />
      ))}
    </div>
  );
};
