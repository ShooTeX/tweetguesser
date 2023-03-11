import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
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
              y: 0,
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
      </AnimatePresence>
    </div>
  );
};
