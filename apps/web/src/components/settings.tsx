import { useAtom } from "jotai";
import { gameConfigAtom, type EndTime, endTimeSchema } from "../atoms/game";
import { type ChangeEventHandler } from "react";

type SettingsProperties = {
  onEndTimeChange?: () => void;
  onEndlessChange?: () => void;
};

export const Settings = ({
  onEndTimeChange,
  onEndlessChange,
}: SettingsProperties) => {
  const [config, setConfig] = useAtom(gameConfigAtom);

  const handleEndTimeChange: ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    setConfig((config) => ({
      ...config,
      endTime: event.target.value as EndTime,
    }));

    onEndTimeChange && onEndTimeChange();
  };

  const handleEndlessChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setConfig((config) => ({
      ...config,
      endless: event.target.checked,
    }));

    onEndlessChange && onEndlessChange();
  };

  return (
    <form className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Tweets starting from</span>
        </label>
        <select
          className="select select-bordered w-full"
          onChange={handleEndTimeChange}
          value={config.endTime}
        >
          {endTimeSchema.options.map((endTime) => (
            <option
              key={endTime}
              value={endTime}
              data-title={endTime.replaceAll("_", " ")}
            >
              {endTime.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control w-full max-w-[13rem]">
        <label className="label cursor-pointer">
          <span className="label-text">Endless Mode</span>
          <input
            type="checkbox"
            className="toggle-primary toggle"
            checked={config.endless}
            onChange={handleEndlessChange}
          />
        </label>
      </div>
    </form>
  );
};
