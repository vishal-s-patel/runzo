import useStore from "@/store";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function Summary() {
  const {present} = useStore();
  const { activeBatters, activeBowler } = present;
  return (
    <Card className="m-2">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/4">Batters</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">B</TableHead>
              <TableHead className="text-right">4s</TableHead>
              <TableHead className="text-right">6s</TableHead>
              <TableHead className="text-right">SR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeBatters.map((batsman, i) => (
              <TableRow key={"B" + i} className="text-xs">
                <TableCell className="font-medium">
                  {batsman.playerName}
                  {i === 0 && "*"}
                </TableCell>
                <TableCell className="text-right">{batsman.runs}</TableCell>
                <TableCell className="text-right">{batsman.balls}</TableCell>
                <TableCell className="text-right">{batsman.fours}</TableCell>
                <TableCell className="text-right">{batsman.sixes}</TableCell>
                <TableCell className="text-right">{((batsman.runs / batsman.balls) * 100).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/4">Bowler</TableHead>
              <TableHead className="text-right">O</TableHead>
              <TableHead className="text-right">M</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">W</TableHead>
              <TableHead className="text-right">ER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="text-xs">
              <TableCell className="font-medium">{activeBowler.playerName}</TableCell>
              <TableCell className="text-right">
                {activeBowler.overs}.{activeBowler.balls}
              </TableCell>
              <TableCell className="text-right">
                {activeBowler.maidens}
              </TableCell>
              <TableCell className="text-right">{activeBowler.runs}</TableCell>
              <TableCell className="text-right">
                {activeBowler.wickets}
              </TableCell>
              <TableCell className="text-right">{(activeBowler.runs / (activeBowler.overs + (activeBowler.balls / 6))).toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default Summary;
