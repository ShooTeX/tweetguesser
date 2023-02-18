export const Settings = () => {
  return (
    <div>
      <div className="form-control w-full max-w-[13rem]">
        <label className="label cursor-pointer">
          <span className="label-text">Endless Mode</span>
          <input type="checkbox" className="toggle-primary toggle" />
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Tweets starting from</span>
        </label>
        <div className="btn-group">
          <input
            type="radio"
            name="options"
            data-title="Today"
            className="btn"
          />
          <input
            type="radio"
            name="options"
            data-title="1 month ago"
            className="btn"
          />
          <input
            type="radio"
            name="options"
            data-title="1 year ago"
            className="btn"
          />
          <input
            type="radio"
            name="options"
            data-title="3 years ago"
            className="btn"
          />
        </div>
      </div>
    </div>
  );
};
