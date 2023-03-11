import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { AtSign } from "lucide-react";
import { useForm } from "react-hook-form";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import { z } from "zod";
import { usernamesAtom } from "../atoms/game";

export const HandleInput = () => {
  const updateUsernames = useSetAtom(usernamesAtom);
  const handleSchema = z.object({
    handle: z
      .string()
      .refine((value) => isAlphanumeric(value, undefined, { ignore: "_" })),
  });

  type HandleData = z.infer<typeof handleSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HandleData>({
    resolver: zodResolver(handleSchema),
    mode: "onSubmit",
    delayError: 100,
    shouldUnregister: true,
  });

  const onSubmit = (data: HandleData) => {
    updateUsernames((usernames) => [...usernames, data.handle]);
    reset();
  };
  return (
    <form className="form-control w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className={clsx("relative", errors.handle && "animate-wiggle")}>
        <label className="input-group">
          <span>
            <AtSign size={16} />
          </span>
          <input
            type="text"
            autoFocus
            className="input-bordered input-primary input flex-1 shrink-0"
            {...register("handle")}
          />
        </label>
        <div className="absolute inset-y-0 right-4 flex flex-col justify-center">
          <kbd className="kbd">⏎</kbd>
        </div>
      </div>
      <label className="label">
        <AnimatePresence>
          {errors.handle && (
            <motion.span
              className="label-text-alt text-error"
              initial={{
                y: -20,
                height: 0,
                opacity: 0,
              }}
              animate={{
                y: 0,
                height: "auto",
                opacity: 1,
              }}
              exit={{
                y: -10,
                height: 0,
                opacity: 0,
              }}
            >
              {errors.handle.message}
            </motion.span>
          )}
        </AnimatePresence>
      </label>
    </form>
  );
};
