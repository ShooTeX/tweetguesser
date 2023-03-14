import type { HTMLMotionProps } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { Bomb } from "lucide-react";
import useMeasure from "react-use-measure";
import {
  emptyUsernamesAtom,
  invalidUsernamesAtom,
  usernamesAtom,
} from "../atoms/game";
import { cn } from "../utils/cn";

const badgeAnimations: HTMLMotionProps<"span"> = {
  layout: true,
  initial: {
    x: 20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" },
  },
  exit: {
    y: -20,
    opacity: 0,
  },
  whileHover: {
    scale: 1.05,
  },
  whileTap: { scale: 0.95 },
};

export const HandleList = ({ className }: { className?: string }) => {
  const [reference, { height: watchHeight }] = useMeasure();
  const [usernames, updateUsernames] = useAtom(usernamesAtom);
  const invalidUsernames = useAtomValue(invalidUsernamesAtom);
  const emptyUsernames = useAtomValue(emptyUsernamesAtom);
  const validUsernames = usernames.filter(
    (username) =>
      !invalidUsernames.includes(username) && !emptyUsernames.includes(username)
  );
  const handleClick = (input: string) => {
    updateUsernames(usernames.filter((username) => username !== input));
  };

  return (
    <motion.div animate={{ height: watchHeight }}>
      <div
        ref={reference}
        className={cn("flex flex-row flex-wrap gap-1", className)}
      >
        <AnimatePresence mode="popLayout">
          {invalidUsernames.map((username) => (
            <motion.span
              key={username}
              className="badge badge-error cursor-pointer transition-none"
              onClick={() => handleClick(username)}
              {...badgeAnimations}
            >
              {username}
            </motion.span>
          ))}
          {emptyUsernames.map((username) => (
            <motion.span
              key={username}
              className="badge badge-warning cursor-pointer transition-none"
              onClick={() => handleClick(username)}
              {...badgeAnimations}
            >
              {username}
            </motion.span>
          ))}
          {validUsernames.map((username) => (
            <motion.span
              key={username}
              className="badge cursor-pointer transition-none"
              onClick={() => handleClick(username)}
              {...badgeAnimations}
            >
              {username}
            </motion.span>
          ))}
          {usernames.length > 1 && (
            <motion.span
              key="remove-all"
              onClick={() => updateUsernames([])}
              className="badge badge-outline badge-error cursor-pointer transition-none"
              {...badgeAnimations}
            >
              <Bomb className="mr-1 h-3 w-3" />
              remove all
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
