import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { AtSign } from "lucide-react";
import { useForm } from "react-hook-form";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import { z } from "zod";
import { cachedInvalidUsernamesAtom, usernamesAtom } from "../atoms/game";

export const HandleInput = () => {
  const [usernames, updateUsernames] = useAtom(usernamesAtom);
  const invalidUsernames = useAtomValue(cachedInvalidUsernamesAtom);
  const handleSchema = z.object({
    handle: z
      .string()
      .transform((value) => value.trim())
      .refine(
        (value) =>
          value === "" || isAlphanumeric(value, undefined, { ignore: "_" })
      )
      .refine((handle) => !usernames.includes(handle), {
        message: "Already added",
      })
      .refine((value) => !invalidUsernames.includes(value), {
        message: "This handle was invalid",
      }),
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
    if (data.handle === "") {
      return;
    }
    const inputUsername = data.handle.toLowerCase();
    updateUsernames((usernames) => [...usernames, inputUsername]);
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
            autoComplete="off"
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
      <AnimatePresence>
        {errors.handle && (
          <motion.div
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
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.handle.message}
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
