import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useStore from "@/store";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import ExtrasDialog from "@/components/ui/extras-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import AutoSuggestion from "@/components/ui/auto-suggestion";
import ScoreBoard from "@/components/layouts/scoreboard";
import Summary from "@/components/layouts/summary";
import ThisOver from "@/components/layouts/current-over";
import { EndInningDialog } from "@/components/features/EndInningDialog";
import { Scorecard } from "@/components/features/ScorecardDialog";

const RUNS = [0, 1, 2, 3, 4, 6];
const EXTRAS: ReadonlyArray<{ label: string; description: string }> = [
  { label: "WD", description: "Wide" },
  { label: "NB", description: "No Ball" },
  { label: "BYE", description: "Bye" },
  { label: "LB", description: "Leg Bye" },
];

function Match() {
  const {
    present,
    updateOver,
    addWicket,
    addNewBowler,
    undo
  } = useStore();

  const navigate = useNavigate();
  // call in useeffect
  // if (present.innings.length === 0) {
  //   navigate("/match-details")
  // }

  const { team1, team2, showBowlerDialog, activeBatters, overs, innings, activeInning, isMatchFinished } = present;

  function handleBallUpdate(run: number) {
    if (showBowlerDialog) {
      setShoNewBowlerDialog(true);
      return;
    }
    if (innings[activeInning].overs.length === overs) {
      setShowEndInnDialog(true);
      return;
    }
    updateOver(run);
  }

  function handleFallofWicket() {
    addWicket(wicketType, outBatsman, whoHelped, extraRuns, newBatsman, extra);
    setWicketType("");
    setOutBatsman("");
    setWhoHelped("");
    setExtraRuns(0);
    setNewBatsman("");
    setExtra("");
  }

  const [wicketType, setWicketType] = useState<string>("bowled");
  const [whoHelped, setWhoHelped] = useState<string>("");
  const [newBatsman, setNewBatsman] = useState<string>("");
  const [outBatsman, setOutBatsman] = useState<string>("");
  const [extra, setExtra] = useState<string>("");
  const [extraRuns, setExtraRuns] = useState<number>(0);
  const [showNewBowlerDialog, setShoNewBowlerDialog] = useState<boolean>(false);
  const [selectedBowler, setSelectedBowler] = useState<string>("");
  const [showEndInnDialog, setShowEndInnDialog] = useState<boolean>(false);
  const [additionalRun, setAdditionalRun] = useState<string>("5");

  

  const handleBowlerChange = (bowler: string) => {
    setSelectedBowler(bowler);
  };

  useEffect(() => {
    if(innings.length === 0) {
      navigate("/match-details");
    }
  }, [])

  useEffect(() => {
    if (showBowlerDialog) {
      setShoNewBowlerDialog(true);
    }
  }, [showBowlerDialog]);

  useEffect(() => {
    if (innings[activeInning]?.overs.length === overs || (innings[0]?.wickets === 10 && activeInning === 0)) { //max wicket
      setShowEndInnDialog(true);
    }
  }, [innings[activeInning]?.overs, innings[0]?.wickets]);

  useEffect(() => {
    if (isMatchFinished) {
      navigate("/post-match");
    }
  }, [isMatchFinished])

  const handleEndInning = () => {
    setShowEndInnDialog(!showEndInnDialog);
  };

  return (
    <section>
      <div className="flex items-center border-b">
        <Button size="icon" variant="ghost">
          <Link to="/match-details">
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="inline-block ms-5">
          {" "}
          {team1} vs {team2}
        </h1>
        <Scorecard />
      </div>
      <ScoreBoard />
      <Summary />
      <ThisOver />
      <Card>
        <CardContent className="p-0">
          <div className="flex">
            <div className="grid grid-cols-3 grid-rows-2  w-3/4">
              {RUNS.map((run, i) => (
                <button
                  key={"R" + i}
                  className="p-4 bg-slate-100 text-black border font-medium"
                  onClick={() => handleBallUpdate(run)}
                >
                  {run}
                </button>
              ))}
            </div>
            <div className="flex flex-col w-1/4">
              <Dialog>
                <DialogTrigger className="p-2 bg-slate-300 border text-green-700 font-medium">
                  UNDO
                </DialogTrigger>
                <DialogContent className="w-11/12 rounded">
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="justify-end flex-row">
                    <DialogClose asChild>
                      <Button type="button" onClick={() => undo()}>
                        Yes
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* <button className="p-2 bg-slate-300 border text-gray-600 font-medium">
                5,7
              </button> */}
              <Dialog>
                <DialogTrigger className="p-2 bg-slate-300 border text-gray-600 font-medium">
                  5,7
                </DialogTrigger>
                <DialogContent className="w-11/12 rounded">
                  <DialogHeader>
                    <DialogTitle>Select additional run</DialogTitle>
                    <Select value={additionalRun}
                    onValueChange={(value) => setAdditionalRun(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select run" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </DialogHeader>
                  <DialogFooter className="justify-end flex-row">
                    <DialogClose asChild>
                      <Button type="button" onClick={() => handleBallUpdate(parseInt(additionalRun))}>
                        Yes
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger className="p-3 bg-slate-300 border text-red-700 font-medium">
                  OUT
                </DialogTrigger>
                <DialogContent className="w-11/12 rounded">
                  <DialogHeader>
                    <DialogTitle className="text-left">
                      Fall of wicket
                    </DialogTitle>
                    {/* <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription> */}
                  </DialogHeader>
                  <Select
                    value={wicketType}
                    onValueChange={(value) => setWicketType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How wicket fall?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="bowled">Bowled</SelectItem>
                        <SelectItem value="caught">Catch out</SelectItem>
                        <SelectItem value="runOutStriker">
                          Run out striker
                        </SelectItem>
                        <SelectItem value="runOutNonStriker">
                          Run out non-striker
                        </SelectItem>
                        <SelectItem value="stumping">Stumping</SelectItem>
                        <SelectItem value="hitWicket">Hit Wicket</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {(wicketType === "runOutStriker" ||
                    wicketType === "runOutNonStriker") && (
                    <>
                      <Label>Who got out?</Label>
                      <Select
                        value={outBatsman}
                        onValueChange={(value) => setOutBatsman(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Who got out?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {activeBatters.map(({ playerName }) => (
                              <SelectItem value={playerName} key={playerName}>
                                {playerName}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="extras">Extras Run</Label>
                        <Input
                          type="text"
                          id="extras"
                          placeholder="Runs"
                          value={extraRuns}
                          onChange={(e) =>
                            setExtraRuns(parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </>
                  )}

                  {wicketType !== "bowled" && wicketType !== "hitWicket" && (
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="helper">Who helped?</Label>
                      <Input
                        type="text"
                        id="helper"
                        placeholder="Player name"
                        value={whoHelped}
                        onChange={(e) => setWhoHelped(e.target.value)}
                      />
                    </div>
                  )}

                  {(wicketType === "hitWicket" ||
                    wicketType === "stumping" ||
                    wicketType === "runOutStriker" ||
                    wicketType === "runOutNonStriker") && (
                    <>
                      <Select
                        value={extra}
                        onValueChange={(value) => setExtra(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Extra Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {EXTRAS.map((extra) => (
                              <SelectItem value={extra.label} key={extra.label}>
                                {extra.description}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="newBatsman">New Batsman</Label>
                    <Input
                      type="text"
                      id="newBatsman"
                      placeholder="Player name"
                      value={newBatsman}
                      onChange={(e) => setNewBatsman(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleFallofWicket}
                      >
                        Save
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="grid grid-cols-4">
            {EXTRAS.map((extra) => (
              <ExtrasDialog
                key={extra.label}
                label={extra.label}
                title={extra.description}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNewBowlerDialog} onOpenChange={setShoNewBowlerDialog}>
        <DialogContent className="w-11/12 rounded">
          <DialogHeader>
            <DialogTitle>Choose bowler</DialogTitle>
          </DialogHeader>
          <AutoSuggestion onBowlerChange={handleBowlerChange} />
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="submit"
                onClick={() => addNewBowler(selectedBowler)}
              >
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EndInningDialog setShowDialog={handleEndInning} overs={overs} runs={innings[0]?.runs} showDialog={showEndInnDialog} teamName={''}/>
    </section>
  );
}

export default Match;
