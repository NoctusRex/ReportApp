export type Report = {
  id: number;
  year: number;
  game: string;
  persons: Array<string>;
  judges: Array<string>;
  problem: string;
  solution: string;
};
