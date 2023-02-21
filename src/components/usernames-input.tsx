import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AtSign } from "lucide-react";
import clsx from "clsx";

const schema = z.object({
  handle: z
    .string()
    .max(15)
    .refine((value) => isAlphanumeric(value, undefined, { ignore: "_" })),
  mode: z.enum(["handle", "following"] as const),
});
export type UsernamesInputData = z.infer<typeof schema>;

type UsernamesInputProperties = {
  onSubmit: (data: UsernamesInputData) => void;
  loading?: boolean;
  disabled?: boolean;
};

export const UsernamesInput = ({
  onSubmit,
  loading = false,
  disabled = false,
}: UsernamesInputProperties) => {
  const [animationParent] = useAutoAnimate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsernamesInputData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    delayError: 100,
    defaultValues: { mode: "handle" },
  });

  const clearAndSubmit = (data: UsernamesInputData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(clearAndSubmit)}>
      <div className="btn-group">
        {schema.shape.mode.options.map((mode) => (
          <input
            key={mode}
            type="radio"
            value={mode}
            className="btn btn-sm"
            data-title={mode}
            {...register("mode")}
          />
        ))}
      </div>
      <div className="form-control mt-4 w-full" ref={animationParent}>
        <div className="relative">
          <label className="input-group">
            <span>
              <AtSign size={16} className={clsx(loading && "animate-spin")} />
            </span>
            <input
              {...register("handle")}
              type="text"
              disabled={disabled || loading}
              autoFocus
              className="input-bordered input-primary input flex-1 shrink-0"
            />
          </label>
          <div className="absolute inset-y-0 right-4 flex flex-col justify-center">
            <kbd className="kbd">⏎</kbd>
          </div>
        </div>
        {!!errors.handle && (
          <label className="label shrink-0">
            <span className="label-text-alt text-error">
              {errors.handle.message}
            </span>
          </label>
        )}
      </div>
    </form>
  );
};
