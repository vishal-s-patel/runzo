export interface Bowler {
  playerName: string,
  overs: number,
  balls: number,
  maidens: number,
  runs: number,
  wickets: number
}

export interface Batter {
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wicketType?: string;
  helper?: string;
  bowler?: string;
}