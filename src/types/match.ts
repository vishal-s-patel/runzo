import { Batter, Bowler } from "./players";

export type TossDecision = 'bat' | 'field';

export type Inning = {
  runs: number;
  wickets: number;
  overs: Array<Array<{ val: string, extra: string | null }>>;
  balls: number;
  batters: Array<Batter>,
  bowlers: Array<Bowler>
}