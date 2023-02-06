import { useAtom } from "jotai";
import type { ChangeEventHandler } from "react";
import { endlessModeAtom, gameConfigAtom } from "../atoms/game";

type StartScreenProps = {
  onPlay: () => void;
};

export const StartScreen = ({ onPlay }: StartScreenProps) => {
  const [config] = useAtom(gameConfigAtom);
  const [, setEndlessModeAtom] = useAtom(endlessModeAtom);

  const handleEndlessChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEndlessModeAtom(event.target.checked);
  };

  return (
    <>
      <h3 className="text-lg font-bold">Logo?</h3>
      <p className="py-4">
        <div className="form-control max-w-xs">
          <label className="label cursor-pointer">
            <span className="label-text">Endless Mode</span>
            <input
              type="checkbox"
              checked={config.endless}
              className="checkbox-primary checkbox"
              onChange={handleEndlessChange}
            />
          </label>
        </div>
      </p>
      <div className="modal-action">
        <button type="button" className="btn-primary btn" onClick={onPlay}>
          Start!
        </button>
      </div>
    </>
  );
};
