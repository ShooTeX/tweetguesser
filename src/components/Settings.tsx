import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { gameConfigAtom, type GameConfig } from "../atoms/game";
import { equals } from "remeda";

export const Settings = () => {
  const [config, setConfig] = useAtom(gameConfigAtom);
  const {
    register,
    watch,
    reset,
    formState: { defaultValues, touchedFields },
  } = useForm<GameConfig>({
    defaultValues: config,
  });

  const isTouched = !!Object.keys(touchedFields).length;

  const formData = watch();

  if (!equals(config, defaultValues) && !isTouched) {
    reset(config);
  }

  if (!equals(config, formData) && isTouched) {
    setConfig(formData);
  }

  return (
    <form>
      <div className="form-control w-full max-w-[13rem]">
        <label className="label cursor-pointer">
          <span className="label-text">Endless Mode</span>
          <input
            type="checkbox"
            className="toggle-primary toggle"
            {...register("endless")}
          />
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Tweets starting from</span>
        </label>
        <div className="btn-group">
          <input
            type="radio"
            value={"today"}
            data-title="Today"
            className="btn"
            {...register("startTime")}
          />
          <input
            type="radio"
            value={"1_month_ago"}
            data-title="1 month ago"
            className="btn"
            {...register("startTime")}
          />
          <input
            type="radio"
            value={"1_year_ago"}
            data-title="1 year ago"
            className="btn"
            {...register("startTime")}
          />
          <input
            type="radio"
            value={"3_years_ago"}
            data-title="3 years ago"
            className="btn"
            {...register("startTime")}
          />
        </div>
      </div>
    </form>
  );
};
