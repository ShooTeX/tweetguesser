import { useState } from "react";

type StartScreenProps = {
  onPlay: () => void;
};

export const StartScreen = ({ onPlay }: StartScreenProps) => {
  const [usernames, setUsernames] = useState<string>();

  console.log(usernames?.split("\n"));

  return (
    <>
      <h3 className="text-lg font-bold">Logo?</h3>
      <p className="py-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Twitter usernames</span>
            <span className="label-text-alt">Separated with new line</span>
          </label>
          <textarea
            value={usernames}
            onChange={(event) => {
              setUsernames(event.target.value);
            }}
            className="textarea-bordered textarea h-24"
            placeholder={`imShooTeX
roxcodes`}
          ></textarea>
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
