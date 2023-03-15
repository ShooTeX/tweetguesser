import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { ListPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tweetIdsAtom } from "../atoms/game";
import { createTweetsListAtom } from "../atoms/tweets-lists";

const createListSchema = z.object({
  name: z.string().max(25).min(1),
});

type CreateListData = z.infer<typeof createListSchema>;

export const CreateListModal = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const createList = useSetAtom(createTweetsListAtom);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateListData>({
    resolver: zodResolver(createListSchema),
    mode: "onChange",
    delayError: 100,
    shouldUnregister: true,
  });

  const onSubmit = (data: CreateListData) => {
    if (!isValid) {
      return;
    }
    createList({ name: data.name, tweetIds });
    setTweetIds([]);
    onSuccess();
  };

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="absolute inset-0 backdrop-blur" onClick={onCancel}></div>
      <div className="modal-box">
        <div className="flex gap-2">
          <ListPlus />
          <h3 className="text-lg font-bold">Create list</h3>
        </div>
        <form
          className="form-control w-full py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            placeholder="List name"
            type="text"
            autoComplete="off"
            autoFocus
            className="input-bordered input-primary input"
            {...register("name")}
          />
          <AnimatePresence>
            {errors.name && (
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
                    {errors.name.message}
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
          <textarea
            rows={8}
            value={tweetIds.join("\n")}
            className="textarea textarea-bordered mt-4 w-full"
            disabled
          ></textarea>
          <div className="modal-action">
            <button className="btn btn-outline btn-error" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValid}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
