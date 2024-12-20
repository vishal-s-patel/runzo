import useStore from "@/store";
import { Card, CardContent } from "../ui/card";

function ScoreBoard() {
  const { present } = useStore();

  const {
    tossDecision,
    tossWinner,
    activeInning,
    innings,
    overs,
    firstInnTeamName,
    secondInnTeamName,
  } = present;

  if (innings.length === 0) return null;

  const CRR =
    (innings[activeInning].runs /
      (innings[activeInning].overs.length * 6 + innings[activeInning].balls)) *
    6;
  return (
    <Card className="m-2">
      <CardContent className="p-2">
        <span>
          {activeInning === 0 ? firstInnTeamName : secondInnTeamName},{" "}
          {activeInning === 0 ? "1st inning" : "2nd inning"}
        </span>
        <h1 className="text-4xl">
          <span>{innings[activeInning].runs}</span>
          <span>&minus;</span>
          <span>{innings[activeInning].wickets}</span>
          <span className="text-base ms-2">
            <span>({innings[activeInning].overs.length || 0}</span>
            <span>.</span>
            <span>{innings[activeInning].balls})</span>
          </span>
        </h1>
        <p className="text-xs mb-1">
          {activeInning === 0
            ? `${tossWinner} chose to ${tossDecision}.`
            : `${secondInnTeamName} need ${
                innings[0].runs - innings[1].runs + 1
              } runs in ${
                (overs * 6) - ((innings[1].overs.length * 6) + innings[1].balls)
              } balls`}
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>CRR: {CRR && CRR !== Infinity ? CRR.toFixed(2) : "0.00"} </div>
          {activeInning === 0 && (
            <div>
              Projected Score:{" "}
              {CRR && CRR !== Infinity ? (overs * CRR).toFixed(0) : 0}
            </div>
          )}
          {activeInning === 1 && (
            <>
              <div>RRR: { (((innings[0].runs + 1) - innings[1].runs) / (((overs * 6) - ((innings[1].overs.length * 6) + innings[1].balls)) / 6)).toFixed(2)}</div>
              <div>Target: {innings[0].runs + 1}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ScoreBoard;
