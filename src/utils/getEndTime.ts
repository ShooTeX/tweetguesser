import { endOfDay, sub } from "date-fns";
import { type EndTime } from "../atoms/game";

export const getEndTime = (endTime: EndTime) => {
  const [amount, unit] = endTime.split("_");

  if (!amount || !unit) {
    return undefined;
  }

  const duration = { [Number(amount) > 1 ? unit : `${unit}s`]: amount };

  return endOfDay(sub(new Date(), duration));
};
