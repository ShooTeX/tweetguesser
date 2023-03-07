import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import isNumeric from "validator/lib/isNumeric";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AtSign } from "lucide-react";
import clsx from "clsx";

const modeSchema = z.enum(["handle", "following", "list"] as const);

const schema = z
  .object({
    input: z
      .string()
      .refine((value) => isAlphanumeric(value, undefined, { ignore: "_" })),
    mode: modeSchema,
  })
  .refine(
    (value) =>
      value.mode === "list"
        ? isNumeric(value.input, { no_symbols: true })
        : value.input.length <= 15,
    { message: "Invalid input", path: ["input"] }
  );

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
    watch,
  } = useForm<UsernamesInputData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    delayError: 100,
    defaultValues: { mode: "handle" },
    shouldUnregister: true,
  });

  const mode = watch("mode");

  const clearAndSubmit = (data: UsernamesInputData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(clearAndSubmit)}>
      <div className="btn-group">
        {modeSchema.options.map((mode) => (
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
              {mode === "list" ? (
                "lists/"
              ) : (
                <AtSign size={16} className={clsx(loading && "animate-spin")} />
              )}
            </span>
            <input
              {...register("input")}
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
        {!!errors.input && (
          <label className="label shrink-0">
            <span className="label-text-alt text-error">
              {errors.input.message}
            </span>
          </label>
        )}
      </div>
    </form>
  );
};
