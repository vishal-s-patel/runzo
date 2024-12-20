import useStore from "@/store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function Scorecard() {
  const { present } = useStore();
  const { innings, firstInnTeamName, secondInnTeamName } = present;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="ml-auto text-xs font-semibold p-1">
          Scorecard
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 rounded">
        <DialogHeader>
          <DialogTitle className="text-left">Scorecard</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {innings.map((inn, i) => (
            <div key={"inn" + i}>
              <p className="bg-sky-300 text-black px-3 py-2">
                {i === 0 ? firstInnTeamName : secondInnTeamName}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-3/5">Batting</TableHead>
                    <TableHead className="text-right">R</TableHead>
                    <TableHead className="text-right">B</TableHead>
                    <TableHead className="text-right">4s</TableHead>
                    <TableHead className="text-right">6s</TableHead>
                    <TableHead className="text-right">SR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inn.batters.map((batter) => (
                    <TableRow className="text-xs" key={batter.playerName}>
                      <TableCell>
                        <p className="font-medium">{batter.playerName}</p>
                        <p className="font-thin">
                          {batter.helper && batter.wicketType === "caught" && (
                            <span className="mr-1">c {batter.helper}</span>
                          )}
                          {batter.helper &&
                            batter.wicketType === "stumping" && (
                              <span className="mr-1">st {batter.helper}</span>
                            )}
                          {batter.helper &&
                            (batter.wicketType === "runOutStriker" ||
                              batter.wicketType === "runOutNonStriker") && (
                              <span className="mr-1">
                                run out {batter.helper}
                              </span>
                            )}
                          {batter.bowler && <span>b {batter.bowler}</span>}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {batter.runs}
                      </TableCell>
                      <TableCell className="text-right">
                        {batter.balls}
                      </TableCell>
                      <TableCell className="text-right">
                        {batter.fours}
                      </TableCell>
                      <TableCell className="text-right">
                        {batter.sixes}
                      </TableCell>
                      <TableCell className="text-right">
                        {((batter.runs / batter.balls) * 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-3/5">Bowling</TableHead>
                    <TableHead className="text-right">O</TableHead>
                    <TableHead className="text-right">M</TableHead>
                    <TableHead className="text-right">R</TableHead>
                    <TableHead className="text-right">W</TableHead>
                    <TableHead className="text-right">ER</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inn.bowlers.map((bowler) => (
                    <TableRow className="text-xs" key={bowler.playerName}>
                      <TableCell>
                        <p className="font-medium">{bowler.playerName}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        {bowler.overs}
                        {bowler.balls > 0 && `.${bowler.balls}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {bowler.maidens}
                      </TableCell>
                      <TableCell className="text-right">
                        {bowler.runs}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        {bowler.wickets}
                      </TableCell>
                      <TableCell className="text-right">
                        {(
                          bowler.runs /
                          (bowler.overs + bowler.balls / 6)
                        ).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
