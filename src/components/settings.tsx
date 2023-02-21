import { useAtom } from "jotai";
import { gameConfigAtom, type EndTime, endTimeSchema } from "../atoms/game";
import { type ChangeEventHandler } from "react";

export const Settings = () => {
  const [config, setConfig] = useAtom(gameConfigAtom);

  const handleEndTimeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setConfig((config) => ({
      ...config,
      endTime: event.target.value as EndTime,
    }));
  };

  const handleEndlessChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setConfig((config) => ({
      ...config,
      endless: event.target.checked,
    }));
  };

  return (
    <form className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Tweets starting from</span>
        </label>
        <div className="btn-group">
          {endTimeSchema.options.map((endTime) => (
            <input
              key={endTime}
              type="radio"
              value={endTime}
              data-title={endTime.replaceAll("_", " ")}
              className="btn"
              checked={config.endTime === endTime}
              onChange={handleEndTimeChange}
            />
          ))}
        </div>
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
