export type Round = {
  status: "pending" | "playing" | "done" | "init";
  possibleAnswers: string[];
  tries: number;
  score: number;
};
