import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { Bomb } from "lucide-react";
import { usernamesAtom } from "../atoms/game";

export const HandleList = () => {
  const [usernames, updateUsernames] = useAtom(usernamesAtom);
  const handleClick = (input: string) => {
    updateUsernames((usernames) =>
      usernames.filter((username) => username !== input)
    );
  };
  return (
    <div className="flex flex-row flex-wrap gap-1">
      <AnimatePresence mode="popLayout">
        {usernames.map((username) => (
          <motion.span
            layout
            key={username}
            className="badge cursor-pointer transition-none"
            onClick={() => handleClick(username)}
            initial={{
              x: 20,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { type: "spring" },
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
          >
            {username}
          </motion.span>
        ))}
        {usernames.length > 1 && (
          <motion.span
            layout
            key="remove-all"
            onClick={() => updateUsernames([])}
            className="badge badge-outline badge-error cursor-pointer transition-none"
            initial={{
              x: 20,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { type: "spring" },
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
          >
            <Bomb className="mr-1 h-3 w-3" />
            remove all
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
