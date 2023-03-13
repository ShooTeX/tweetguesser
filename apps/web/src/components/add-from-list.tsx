import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { Users, Loader2, XCircle, AlertTriangle, List } from "lucide-react";
import { useForm } from "react-hook-form";
import isNumeric from "validator/lib/isNumeric";
import { z } from "zod";
import { usernamesAtom } from "../atoms/game";
import { api } from "../utils/api";

const addFromListSchema = z.object({
  listId: z
    .string()
    .refine((value) => value === "" || isNumeric(value, { no_symbols: true })),
});

type AddFromListData = z.infer<typeof addFromListSchema>;

// INFO: duplicate of "AddFromFollowing", too lazy to make it reusable :)
export const AddFromListModal = ({
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
  } = useForm<AddFromListData>({
    resolver: zodResolver(addFromListSchema),
    mode: "onSubmit",
    delayError: 100,
    shouldUnregister: true,
  });
  const listId = watch("listId");
  const {
    refetch: fetch,
    isFetching,
    isError,
  } = api.twitter.getListMembers.useQuery(
    { id: listId },
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

  const onSubmit = (data: AddFromListData) => {
    if (!data.listId) {
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
          <h3 className="text-lg font-bold">Add from list</h3>
        </div>
        <form
          className="form-control w-full py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div
            className={clsx(
              "relative",
              (errors.listId || isError) && "animate-wiggle"
            )}
          >
            <label className="input-group">
              <span>
                <List size={16} />
              </span>
              <input
                autoComplete="off"
                disabled={isFetching}
                type="text"
                autoFocus
                placeholder="1629851852270448645"
                className="input-bordered input-primary input flex-1 shrink-0"
                {...register("listId")}
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
            {errors.listId && (
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
                    {errors.listId.message}
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        <div className="flex items-center justify-center gap-1 text-sm">
          <AlertTriangle className="text-warning h-4 w-4" />
          <span>Your previous handles will be deleted</span>
        </div>
      </div>
    </div>
  );
};
