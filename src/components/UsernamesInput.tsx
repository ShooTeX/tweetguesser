import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const schema = z.object({
  handle: z
    .string()
    .max(15)
    .refine((value) => isAlphanumeric(value, undefined, { ignore: "_" })),
});
type FormData = z.infer<typeof schema>;

type UsernamesInputProps = {
  onSubmit: (data: FormData) => void;
};

export const UsernamesInput = ({ onSubmit }: UsernamesInputProps) => {
  const [animationParent] = useAutoAnimate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    delayError: 100,
  });

  const clearAndSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(clearAndSubmit)}>
      <div className="form-control w-full max-w-xs" ref={animationParent}>
        <label className="label">
          <span className="label-text">Twitter handle</span>
        </label>
        <div className="relative">
          <input
            {...register("handle")}
            type="text"
            autoFocus
            className="input-bordered input-primary input w-full max-w-xs flex-shrink-0"
          />
          <div className="absolute inset-y-0 right-4 flex flex-col justify-center">
            <kbd className="kbd">⏎</kbd>
          </div>
        </div>
        {!!errors.handle && (
          <label className="label flex-shrink-0">
            <span className="label-text-alt text-error">
              {errors.handle.message}
            </span>
          </label>
        )}
      </div>
    </form>
  );
};
