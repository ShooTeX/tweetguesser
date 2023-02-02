export type Round = {
  status: "pending" | "playing" | "done";
  possibleAnswers: string[];
  tries: number;
  score: number;
};
