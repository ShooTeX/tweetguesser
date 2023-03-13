import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { Users, AtSign, Loader2, XCircle, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usernamesAtom } from "../atoms/game";
import { api } from "../utils/api";
import { basicHandleSchema } from "./handle-input";

const addFromFollowingSchema = z.object({
  handle: basicHandleSchema,
});

type AddFromFollowingData = z.infer<typeof addFromFollowingSchema>;

export const AddFromFollowingModal = ({
  onSuccess,
  onBackdropClick,
}: {
  onSuccess: () => void;
  onBackdropClick: () => void;
}) => {
  const updateUsernames = useSetAtom(usernamesAtom);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddFromFollowingData>({
    resolver: zodResolver(addFromFollowingSchema),
    mode: "onSubmit",
    delayError: 100,
    shouldUnregister: true,
  });
  const username = watch("handle");
  const {
    refetch: fetch,
    isFetching,
    isError,
  } = api.twitter.getRandomFollowing.useQuery(
    { username },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: false,
      onSuccess: (data) => {
        if (data.length === 0) {
          return;
        }

        updateUsernames(data);
        onSuccess();
      },
    }
  );

  const onSubmit = (data: AddFromFollowingData) => {
    if (!data.handle) {
      return;
    }
    void fetch();
  };

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div
        className="absolute inset-0 backdrop-blur"
        onClick={onBackdropClick}
      ></div>
      <div className="modal-box">
        <div className="flex gap-2">
          <Users />
          <h3 className="text-lg font-bold">Add from following</h3>
        </div>
        <form
          className="form-control w-full py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div
            className={clsx(
              "relative",
              (errors.handle || isError) && "animate-wiggle"
            )}
          >
            <label className="input-group">
              <span>
                <AtSign size={16} />
              </span>
              <input
                autoComplete="off"
                disabled={isFetching}
                type="text"
                autoFocus
                className="input-bordered input-primary input flex-1 shrink-0"
                {...register("handle")}
              />
            </label>
            <AnimatePresence initial={false}>
              <motion.div
                key={isFetching ? "fetching" : isError ? "error" : "kbd"}
                className="absolute inset-y-0 right-4 flex flex-col justify-center"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring" }}
              >
                {isFetching ? (
                  <Loader2 className="text-secondary shrink-0 animate-spin" />
                ) : isError ? (
                  <XCircle className="text-error shrink-0" />
                ) : (
                  <kbd className="kbd">⏎</kbd>
                )}
              </motion.div>
            </AnimatePresence>
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
        <div className="flex justify-center gap-1">
          <AlertTriangle className="text-warning" />
          <span>Your previous handles will be deleted</span>
        </div>
      </div>
    </div>
  );
};
