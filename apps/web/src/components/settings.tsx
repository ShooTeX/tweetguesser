import { useAtom } from "jotai";
import { gameConfigAtom, type EndTime, endTimeSchema } from "../atoms/game";
import { type ChangeEventHandler } from "react";
import { EyeOff, History, Infinity } from "lucide-react";

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

  const handleHideUrlsChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setConfig((config) => ({
      ...config,
      hideUrls: event.target.checked,
    }));
  };

  return (
    <form className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center">
            <History className="mr-1 h-4 w-4" />
            Tweets starting from
          </span>
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
      <div className="form-control w-full">
        <label className="label cursor-pointer">
          <span className="label-text flex flex-col">
            <span className="flex items-center">
              <EyeOff className="mr-1 h-4 w-4" />
              Hide URLs
            </span>
            <span className="label-text-alt opacity-70">
              Don&apos;t show urls in tweets
            </span>
          </span>
          <input
            type="checkbox"
            className="toggle-primary toggle"
            checked={config.hideUrls}
            onChange={handleHideUrlsChange}
          />
        </label>
      </div>
      <div className="form-control w-full">
        <label className="label cursor-pointer">
          <span className="label-text flex flex-col">
            <span className="flex items-center justify-center">
              <Infinity className="mr-1 h-4 w-4" />
              Endless Mode
            </span>
            <span className="label-text-alt opacity-70">Play forever...</span>
          </span>
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
