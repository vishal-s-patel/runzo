import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Batter, Bowler, Inning, TossDecision } from "./types";
import { immer } from 'zustand/middleware/immer';

export const LOCAL_STORAGE_KEY = "scores";

const MAX_WICKETS = 10;

function saveToLocalStorage(state: CricketStoreState) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function loadFromLocalStorage(): Partial<CricketStoreState> | null {
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  return savedState ? JSON.parse(savedState) : null;
}

function getTeamName(tossWinner: string, tossDecision: string, team1: string, team2: string) {
  let currentInning;
  if (tossDecision === "bat") {
    currentInning = tossWinner;
  } else {
    currentInning = tossWinner === team1 ? team2 : team1;
  }
  if (currentInning === team1) {
    return { first: team1, second: team2 };
  } else {
    return { first: team2, second: team1 };
  }
}

type CricketStore = {
  team1: string;
  team2: string;
  tossWinner: string;
  tossDecision: string;
  overs: number;
  activeInning: number;
  innings: Array<Inning>;
  activeBatters: Array<Batter>;
  activeBowler: Bowler;
  currentOver: Array<{ val: string, extra: string | null }>
  showBowlerDialog: boolean;
  isMatchFinished: boolean;
  description: string;
  matchWinner: string;
  firstInnTeamName: string;
  secondInnTeamName: string;
}

type CricketStoreState = {
  past: CricketStore[];
  present: CricketStore;
}

type CricketStoreActions = {
  setMatchDetails: (team1: string, team2: string, tossWinner: string, tossDecision: TossDecision, overs: number) => void,
  setOpeningPlayers: (striker: string, nonStriker: string, bowler: string) => void,
  updateOver: (run: number) => void,
  rotateStrikes: () => void,
  changeOver: () => void,
  addNewBowler: (bowlerName: string) => void,
  addExtra: (runs: number, type: string) => void,
  addWicket: (wicketType: string, outBatsman: string, helper: string, run: number, newBatsman: string, extra: string) => void,
  checkResult: () => void,
  undo: () => void;
}

const useStore = create<CricketStoreState & CricketStoreActions>()(
  devtools(
    immer((set, get) => {
      const initialState: CricketStoreState = {
        past: [],
        present: {
          team1: "",
          team2: "",
          tossWinner: "",
          tossDecision: "",
          overs: 0,
          activeInning: 0,
          innings: [],
          activeBatters: [],
          activeBowler: {} as Bowler,
          currentOver: [],
          showBowlerDialog: false,
          isMatchFinished: false,
          description: "",
          matchWinner: "",
          firstInnTeamName: "",
          secondInnTeamName: "",
        },
        ...loadFromLocalStorage(),
      };
      return {
        ...initialState,
        setMatchDetails: (team1, team2, tossWinner, tossDecision, overs) => {
          set((state) => {
            state.present.team1 = team1;
            state.present.team2 = team2;
            state.present.tossWinner = tossWinner;
            state.present.tossDecision = tossDecision;
            state.present.overs = overs;
            const { first, second } = getTeamName(tossWinner, tossDecision, team1, team2);
            state.present.firstInnTeamName = first;
            state.present.secondInnTeamName = second;
            saveToLocalStorage(state);
          })
        },
        setOpeningPlayers: (striker, nonStriker, bowler) => {
          const { present } = get();
          set((state) => {
            if (present.innings.length > 0) {
              state.present.activeInning = 1;
            }
            state.present.innings.push({
              runs: 0,
              wickets: 0,
              overs: [],
              balls: 0,
              bowlers: [
                { playerName: bowler, overs: 0, runs: 0, balls: 0, maidens: 0, wickets: 0 }
              ],
              batters: [
                { playerName: striker, runs: 0, balls: 0, fours: 0, sixes: 0 },
                { playerName: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 }
              ]
            });
            state.present.activeBatters = [
              { playerName: striker, runs: 0, balls: 0, fours: 0, sixes: 0 },
              { playerName: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 }
            ];
            state.present.activeBowler = { playerName: bowler, overs: 0, runs: 0, balls: 0, maidens: 0, wickets: 0 };
            state.present.currentOver = [];
            saveToLocalStorage(state);
          })
        },
        updateOver: (run) => {
          const { present } = get();
          set((state) => {
            state.past.push(present);
            //update run
            state.present.innings[present.activeInning].runs += run;
            //update over
            state.present.innings[present.activeInning].balls += 1;
            //update current over
            state.present.currentOver.push({ val: run.toString(), extra: null });
            //update batsman stats
            const batIndx = present.innings[present.activeInning].batters.findIndex(({ playerName }) => present.activeBatters[0].playerName === playerName);
            state.present.activeBatters[0].runs += run;
            state.present.innings[present.activeInning].batters[batIndx].runs += run;
            state.present.activeBatters[0].balls += 1;
            state.present.innings[present.activeInning].batters[batIndx].balls += 1;
            if (run === 4) {
              state.present.activeBatters[0].fours += 1;
              state.present.innings[present.activeInning].batters[batIndx].fours += 1;
            }
            if (run === 6) {
              state.present.activeBatters[0].sixes += 1;
              state.present.innings[present.activeInning].batters[batIndx].sixes += 1;
            }
            //update bowler stats
            const bowlIndx = present.innings[present.activeInning].bowlers.findIndex(({ playerName }) => present.activeBowler.playerName === playerName);
            state.present.activeBowler.balls += 1;
            state.present.innings[present.activeInning].bowlers[bowlIndx].balls += 1;
            state.present.activeBowler.runs += run;
            state.present.innings[present.activeInning].bowlers[bowlIndx].runs += run;
          });
          get().checkResult();
          if ((run % 2 !== 0 && present.innings[present.activeInning].balls < 5) || (run % 2 === 0 && present.innings[present.activeInning].balls === 5)) {
            get().rotateStrikes();
          }
          get().changeOver();
        },
        rotateStrikes: () => {
          const { present } = get();
          set((state) => {
            state.present.activeBatters[0] = present.activeBatters[1];
            state.present.activeBatters[1] = present.activeBatters[0];
            saveToLocalStorage(state);
          })
        },
        changeOver: () => {
          const { present } = get();
          set((state) => {
            if (present.innings[present.activeInning].balls === 6) {
              state.present.showBowlerDialog = present.innings[present.activeInning].overs.length + 1 !== present.overs ? true : false;
              state.present.innings[present.activeInning].overs.push(present.currentOver);
              state.present.innings[present.activeInning].balls = 0;
              const bowlIndex = present.innings[present.activeInning].bowlers.findIndex(({ playerName }) => playerName === present.activeBowler.playerName);
              state.present.innings[present.activeInning].bowlers[bowlIndex].balls = 0;
              state.present.innings[present.activeInning].bowlers[bowlIndex].overs += 1;
            }
            saveToLocalStorage(state);
          })
        },
        addNewBowler: (bowlerName) => {
          const { present } = get();
          set((state) => {
            const bowler = present.innings.at(-1)?.bowlers.find(({ playerName }) => playerName === bowlerName);
            if (bowler) {
              state.present.activeBowler = bowler;
            } else {
              const newBowler = { playerName: bowlerName, overs: 0, balls: 0, maidens: 0, wickets: 0, runs: 0 };
              state.present.activeBowler = newBowler;
              state.present.innings[present.activeInning].bowlers.push(newBowler);
            }
            state.present.showBowlerDialog = false;
            state.present.currentOver = [];
          })
        },
        addExtra: (runs, type) => {
          const { present } = get();
          set((state) => {
            state.past.push(present);
            let totalRuns = runs;
            const bowlIndex = present.innings[present.activeInning].bowlers.findIndex(({ playerName }) => playerName === present.activeBowler.playerName);
            if (type === "WD" || type === "NB") {
              totalRuns += 1;
              state.present.currentOver.push({ val: (runs + 1).toString(), extra: type });
            } else {
              const batIndex = present.innings[present.activeInning].batters.findIndex(({ playerName }) => playerName === present.activeBatters[0].playerName);
              state.present.currentOver.push({ val: runs + type, extra: null });
              state.present.activeBowler.balls += 1;
              state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
              state.present.activeBatters[0].balls += 1;
              state.present.innings[present.activeInning].batters[batIndex].balls += 1;
              state.present.innings[present.activeInning].balls += 1;
            }
            state.present.innings[present.activeInning].runs += totalRuns;
            state.present.activeBowler.runs += totalRuns;
            state.present.innings[present.activeInning].bowlers[bowlIndex].runs += totalRuns;
            saveToLocalStorage(state);
          });
          if ((runs > 0 || present.innings[present.activeInning].balls === 5) && (type !== "WD" && type !== "NB")) {
            if ((runs % 2 !== 0 && present.innings[present.activeInning].balls < 5) || (runs % 2 === 0 && present.innings[present.activeInning].balls === 5)) {
              get().rotateStrikes();
            }
          }
          get().changeOver();
        },
        addWicket: (wicketType, outBatsman, whoHelped, extraRuns, newBatsman, extra) => {
          const { present } = get();
          set((state) => {
            state.past.push(present);
            const batIndex = present.innings[present.activeInning].batters.findIndex(({ playerName }) => playerName === present.activeBatters[0].playerName);
            const bowlIndex = present.innings[present.activeInning].bowlers.findIndex(({ playerName }) => playerName === present.activeBowler.playerName);
            const newBatter: Batter = { playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 };
            switch (wicketType) {
              case "bowled":
                state.present.currentOver.push({ val: "W", extra: null });
                state.present.activeBowler.balls += 1;
                state.present.activeBowler.wickets += 1;
                state.present.innings[present.activeInning].balls += 1;
                state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
                state.present.innings[present.activeInning].bowlers[bowlIndex].wickets += 1;
                state.present.innings[present.activeInning].batters[batIndex].balls += 1;
                state.present.innings[present.activeInning].batters[batIndex].wicketType = wicketType;
                state.present.innings[present.activeInning].batters[batIndex].bowler = present.activeBowler.playerName;
                state.present.activeBatters.shift();
                state.present.activeBatters.unshift(newBatter);
                break;
              case "caught":
                state.present.currentOver.push({ val: "W", extra: null });
                state.present.activeBowler.balls += 1;
                state.present.activeBowler.wickets += 1;
                state.present.innings[present.activeInning].balls += 1;
                state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
                state.present.innings[present.activeInning].bowlers[bowlIndex].wickets += 1;
                state.present.innings[present.activeInning].batters[batIndex].balls += 1;
                state.present.innings[present.activeInning].batters[batIndex].helper = whoHelped;
                state.present.innings[present.activeInning].batters[batIndex].wicketType = wicketType;
                state.present.innings[present.activeInning].batters[batIndex].bowler = present.activeBowler.playerName;
                state.present.activeBatters.shift();
                state.present.activeBatters.unshift(newBatter);
                break;
              case "stumping":
                state.present.currentOver.push({ val: "W", extra: extra || null });
                state.present.activeBowler.wickets += 1;
                state.present.innings[present.activeInning].bowlers[bowlIndex].wickets += 1;
                state.present.innings[present.activeInning].batters[batIndex].helper = whoHelped;
                state.present.innings[present.activeInning].batters[batIndex].wicketType = wicketType;
                state.present.innings[present.activeInning].batters[batIndex].bowler = present.activeBowler.playerName;
                if (extra !== "WD" && extra !== "NB") {
                  state.present.activeBowler.balls += 1;
                  state.present.innings[present.activeInning].balls += 1;
                  state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
                  state.present.innings[present.activeInning].batters[batIndex].balls += 1;
                } else {
                  state.present.innings[present.activeInning].runs += 1;
                  state.present.innings[present.activeInning].bowlers[bowlIndex].runs += 1;
                  state.present.activeBowler.runs += 1;
                }
                state.present.activeBatters.shift();
                state.present.activeBatters.unshift(newBatter);
                break;
              case "hitWicket":
                state.present.currentOver.push({ val: "W", extra: extra || null });
                state.present.activeBowler.wickets += 1;
                state.present.innings[present.activeInning].bowlers[bowlIndex].wickets += 1;
                state.present.innings[present.activeInning].batters[batIndex].wicketType = wicketType;
                state.present.innings[present.activeInning].batters[batIndex].bowler = present.activeBowler.playerName;
                if (extra !== "WD" && extra !== "NB") {
                  state.present.activeBowler.balls += 1;
                  state.present.innings[present.activeInning].balls += 1;
                  state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
                  state.present.innings[present.activeInning].batters[batIndex].balls += 1;
                } else {
                  state.present.innings[present.activeInning].runs += 1;
                  state.present.innings[present.activeInning].bowlers[bowlIndex].runs += 1;
                  state.present.activeBowler.runs += 1;
                }
                state.present.activeBatters.shift();
                state.present.activeBatters.unshift(newBatter);
                break;
              case "runOutNonStriker":
              case "runOutStriker":
                state.present.currentOver.push({ val: extraRuns > 0 ? extraRuns.toString() + "W" : "W", extra: extra || null });
                const obIndex = present.innings[present.activeInning].batters.findIndex(({ playerName }) => playerName === outBatsman);
                state.present.innings[present.activeInning].batters[obIndex].wicketType = wicketType;
                state.present.innings[present.activeInning].batters[obIndex].helper = whoHelped;

                const outIndex = present.activeBatters.findIndex(({ playerName }) => playerName === outBatsman);
                if (outIndex === 0) {
                  if (extra === "") {
                    state.present.innings[present.activeInning].batters[obIndex].runs += extraRuns;
                  }
                  if (extra !== "WD" && extra !== "NB") {
                    state.present.activeBowler.balls += 1;
                    state.present.innings[present.activeInning].balls += 1;
                    state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
                    state.present.innings[present.activeInning].batters[obIndex].balls += 1;
                  }
                } else {
                  const noIndex = present.innings[present.activeInning].batters.findIndex(({ playerName }) => playerName === present.activeBatters[0].playerName);
                  if (extra === "") {
                    state.present.innings[present.activeInning].batters[noIndex].runs += extraRuns;
                  }
                  if (extra !== "WD" && extra !== "NB") {
                    state.present.activeBowler.balls += 1;
                    state.present.innings[present.activeInning].balls += 1;
                    state.present.innings[present.activeInning].bowlers[bowlIndex].balls += 1;
                    state.present.innings[present.activeInning].batters[noIndex].balls += 1;
                    state.present.activeBatters[0].balls += 1;
                  }
                }
                state.present.innings[present.activeInning].runs += extraRuns;
                state.present.activeBowler.runs += extraRuns;
                state.present.innings[present.activeInning].bowlers[bowlIndex].runs += extraRuns;
                if (extra === "WD" || extra === "NB") {
                  state.present.innings[present.activeInning].runs += 1;
                  state.present.activeBowler.runs += 1;
                  state.present.innings[present.activeInning].bowlers[bowlIndex].runs += 1;
                }
                state.present.activeBatters.splice(outIndex, 1);
                if (wicketType === "runOutStriker") {
                  state.present.activeBatters.unshift({ playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 });
                } else {
                  state.present.activeBatters.push({ playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 });
                }
                break;
            }
            state.present.innings[present.activeInning].wickets += 1;
            state.present.innings[present.activeInning].batters.push({ playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 });
          });
          get().checkResult();
          if (present.innings[present.activeInning].balls === 5 && extra !== "WD" && extra !== "NB") {
            get().rotateStrikes();
          }
          get().changeOver();
        },
        checkResult: () => {
          const { present } = get();
          set((state) => {
            if (present.activeInning === 1) {
              if (present.innings[1].runs > present.innings[0].runs) {
                state.present.isMatchFinished = true;
                state.present.description = `${present.secondInnTeamName} won by ${MAX_WICKETS - present.innings[1].wickets} wickets`;
                state.present.matchWinner = present.secondInnTeamName;
              } else if (present.innings[1].runs < present.innings[0].runs && (present.innings[1].overs.length === present.overs || present.innings[1].wickets === MAX_WICKETS)) {
                state.present.isMatchFinished = true;
                state.present.description = `${present.firstInnTeamName} won by ${present.innings[0].runs - present.innings[1].runs} runs`;
                state.present.matchWinner = present.firstInnTeamName;
              }
            }
          })
        },
        undo: () => {
          set((state) => {
            if (state.past.length === 0) return;
            state.present = state.past.pop()!;
          })
        }
      }
    })
  )
)

// interface ScoreState {
//   past: ScoreState[],
//   present: 
//   innings: Array<{
//     run: number;
//     wickets: number;
//     overs: ReadonlyArray<ReadonlyArray<{ val: string, extra: string | null }>>;
//     balls: number;
//     batters: ReadonlyArray<Batter>,
//     bowlers: ReadonlyArray<Bowler>
//   }>,
//   team1: string;
//   team2: string;
//   tossWinner: string;
//   tossDecision: TossDecision;
//   overs: number;
//   activeBatters: Array<Batter>
//   activeBowler: Bowler
//   currentOver: {
//     balls: number;
//     all: ReadonlyArray<{ val: string, extra: string | null }>;
//   };
//   runs: number;
//   wickets: number;
//   oversBowled: ReadonlyArray<ReadonlyArray<{ val: string, extra: string | null }>>;
//   showBowlerDialog: boolean;
//   activeInning: 0 | 1;
//   matchStatus: 'Live' | 'Finished';
//   matchWinner: string;
//   description: string;
//   setMatchDetails: (
//     team1: string,
//     team2: string,
//     tossWinner: string,
//     tossDecision: TossDecision,
//     overs: number
//   ) => void;
//   setOpeningPlayers: (
//     striker: string,
//     nonStriker: string,
//     bowler: string
//   ) => void;
//   updateOver: (run: number) => void;
//   addExtra: (extraRuns: number, type: string | null) => void;
//   changeOver: () => void;
//   addWicket: (wicketType: string, outBatsman: string, helper: string, run: number, newBatsman: string, extra: string) => void;
//   updateBatsmanStats: (run: number) => void;
//   updateBowlerStats: (validBall: boolean, run: number, wicket: boolean) => void;
//   rotateStrikes: (run: number) => void;
//   addNewBowler: (bowlerName: string) => void;
//   startSecondInning: () => void;
//   checkResult: () => void;
// }

// const useStore = create<ScoreState>()(
//   devtools(
//     immer(
//       (set, get) => {
//         const initialState: ScoreState = {
//           past: [],
//         innings: [
//           {
//             run: 0,
//             wickets: 0,
//             overs: [],
//             balls: 0,
//             batters: [],
//             bowlers: []
//           },
//           {
//             run: 0,
//             wickets: 0,
//             overs: [],
//             balls: 0,
//             batters: [],
//             bowlers: []
//           }
//         ],
//         activeInning: 0,
//         team1: "Team 1",
//         team2: "Team 2",
//         tossWinner: "Team 1",
//         tossDecision: "bat",
//         overs: 10,
//         currentOver: {
//           balls: 0,
//           all: [],
//         },
//         activeBatters: [],
//         activeBowler: {} as any,
//         runs: 0,
//         oversBowled: [],
//         wickets: 0,
//         showBowlerDialog: false,
//         matchStatus: 'Live',
//         matchWinner: '',
//         description: '',
//         }

//         setMatchDetails: (team1, team2, tossWinner, tossDecision, overs) =>
//           set(() => ({ team1, team2, tossWinner, tossDecision, overs })),
//         setOpeningPlayers: (striker, nonStriker, bowler) =>
//           set(() => ({
//             activeBatters: [
//               { playerName: striker, runs: 0, balls: 0, fours: 0, sixes: 0 },
//               { playerName: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 }
//             ],
//             activeBowler: { playerName: bowler, overs: 0, maidens: 0, runs: 0, wickets: 0, balls: 0 }
//           })),
//         updateOver: (run) => {
//           set((state) => ({
//             runs: state.runs + run,
//             currentOver: {
//               balls: state.currentOver.balls + 1,
//               all: [...state.currentOver.all, { val: run.toString(), extra: null }],
//             },
//           }));
//           get().updateBatsmanStats(run);
//           get().updateBowlerStats(true, run, false);
//           get().changeOver();
//           get().checkResult();
//         },
//         addExtra: (extraRuns, type) => {
//           set((state) => {
//             let totalRuns = state.runs;
//             let extra = '';
//             let totalBalls = state.currentOver.balls;
//             let activeBatters = state.activeBatters;
//             let activeBowler = state.activeBowler
//             if (type === 'WD' || type === 'NB') {
//               totalRuns += extraRuns + 1;
//               extra = (extraRuns + 1).toString();
//               if (type === 'NB') {
//                 activeBatters = [{ ...activeBatters[0], runs: activeBatters[0].runs + extraRuns }, activeBatters[1]]
//               }
//               activeBowler = { ...activeBowler, runs: activeBowler.runs + extraRuns + 1 }
//             } else if (type === 'LB' || type === 'BYE') {
//               totalRuns += extraRuns;
//               extra = extraRuns + type;
//               type = null;
//               totalBalls++;
//               activeBatters = [{ ...activeBatters[0], balls: activeBatters[0].balls + 1 }, activeBatters[1]],
//                 activeBowler = { ...activeBowler, runs: activeBowler.runs + extraRuns, balls: activeBowler.balls + 1 }
//             }
//             return {
//               activeBatters,
//               activeBowler,
//               runs: totalRuns,
//               currentOver: { balls: totalBalls, all: [...state.currentOver.all, { val: extra, extra: type }] }
//             }
//           });
//           get().rotateStrikes(extraRuns);
//           get().changeOver();
//         },
//         changeOver: () => set((state) => {
//           if (state.currentOver.balls < 6) {
//             return state;
//           }
//           const bowler = state.innings.at(state.activeInning)?.bowlers.find(bowler => bowler.playerName === state.activeBowler.playerName);

//           return {
//             innings: state.activeInning === 0
//               ? [
//                 {
//                   ...state.innings[0],
//                   bowlers: bowler ? [...state.innings[0].bowlers.filter(bowler => bowler.playerName !== state.activeBowler.playerName), state.activeBowler] : [...state.innings[0].bowlers, state.activeBowler],
//                 },
//                 state.innings[1]
//               ]
//               : [
//                 state.innings[0],
//                 {
//                   ...state.innings[1],
//                   bowlers: bowler ? [...state.innings[1].bowlers.filter(bowler => bowler.playerName !== state.activeBowler.playerName), state.activeBowler] : [...state.innings[1].bowlers, state.activeBowler],
//                 }
//               ]
//             ,
//             oversBowled: [...state.oversBowled, [...state.currentOver.all]],
//             currentOver: { balls: 0, all: [] },
//             showBowlerDialog: state.oversBowled.length + 1 !== state.overs ? true : false,
//           }
//         }),
//         addWicket: (wicketType, outBatsman, helper, run, newBatsman, extra) => {
//           set((state) => {
//             let activeBatters;
//             let wicket;
//             let updateBowler;
//             let totalRun = run;
//             if (outBatsman == '') {
//               activeBatters = [
//                 { playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 },
//                 state.activeBatters[1]
//               ];
//               wicket = {
//                 ...state.activeBatters[0],
//                 wicketType,
//                 bowler: state.activeBowler.playerName,
//               }
//               if (wicketType === 'bowled' || wicketType === 'hit-wicket') {
//                 wicket = {
//                   ...wicket,
//                   balls: state.activeBatters[0].balls + 1
//                 }
//                 updateBowler = { ...state.activeBowler, balls: state.activeBowler.balls + 1, wickets: state.activeBowler.wickets + 1 }
//                 if (updateBowler.balls > 5) {
//                   updateBowler.balls = 0;
//                   updateBowler.overs += 1;
//                 }
//               } else if (wicketType === 'caught' || (wicketType === 'stumping' && extra === '')) {
//                 wicket = {
//                   ...wicket,
//                   helper,
//                   balls: state.activeBatters[0].balls + 1
//                 };
//                 updateBowler = { ...state.activeBowler, balls: state.activeBowler.balls + 1, wickets: state.activeBowler.wickets + 1 };
//                 if (updateBowler.balls > 5) {
//                   updateBowler.balls = 0;
//                   updateBowler.overs += 1;
//                 }
//               } else {
//                 wicket = { ...wicket, helper };
//                 updateBowler = { ...state.activeBowler, wickets: state.activeBowler.wickets + 1 };
//                 totalRun += 1;
//               }
//             } else {
//               const index = state.activeBatters.findIndex(batsman => batsman.playerName === outBatsman); //remove batsman at this index
//               const batsmanRuns = extra === 'NB' ? run : 0;
//               wicket = {
//                 ...state.activeBatters[index],
//                 balls: index === 0 && extra !== 'WD' && extra !== 'NB' ? state.activeBatters[0].balls + 1 : state.activeBatters[0].balls,
//                 helper,
//                 wicketType: 'Runout',
//                 runs: index === 0 && extra === 'NB' ? state.activeBatters[0].runs + batsmanRuns : state.activeBatters[0].runs
//               };

//               updateBowler = {
//                 ...state.activeBowler,
//                 balls: extra !== 'WD' && extra !== 'NB' ? state.activeBowler.balls + 1 : state.activeBowler.balls
//               };

//               if (extra === 'WD' || extra === 'NB') {
//                 totalRun++;
//               }

//               if (wicketType === 'runOutStriker') {
//                 activeBatters = [
//                   { playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 },
//                   state.activeBatters[index ^ 1]
//                 ];
//                 if (index === 1) {
//                   activeBatters = [
//                     activeBatters[0],
//                     {
//                       ...activeBatters[1],
//                       balls: extra !== 'WD' && extra !== 'NB' ? activeBatters[1].balls + 1 : activeBatters[1].balls,
//                       runs: batsmanRuns
//                     }
//                   ]
//                 }
//               } else {
//                 activeBatters = [//increase runs balls
//                   state.activeBatters[index ^ 1],
//                   { playerName: newBatsman, runs: 0, balls: 0, fours: 0, sixes: 0 }
//                 ];
//                 if (index === 1) {
//                   activeBatters = [
//                     {
//                       ...activeBatters[0],
//                       balls: extra !== 'WD' && extra !== 'NB' ? activeBatters[0].balls + 1 : activeBatters[0].balls,
//                       runs: batsmanRuns
//                     },
//                     activeBatters[1],
//                   ]
//                 }
//               }
//             }

//             return {
//               innings: state.activeInning === 0 ? [
//                 {
//                   ...state.innings[0],
//                   batters: [...state.innings[0].batters, wicket],
//                   wickets: state.innings[0].wickets + 1
//                 },
//                 state.innings[1]
//               ] : [
//                 state.innings[0],
//                 {
//                   ...state.innings[1],
//                   batters: [...state.innings[1].batters, wicket],
//                   wickets: state.innings[1].wickets + 1
//                 },
//               ],
//               activeBatters,
//               currentOver: {
//                 balls: extra !== 'WD' && extra !== 'NB' ? state.currentOver.balls + 1 : state.currentOver.balls,
//                 all: [...state.currentOver.all, { val: 'W', extra: extra.length > 0 ? extra : null }]
//               },
//               activeBowler: updateBowler,
//               runs: state.runs + totalRun
//             }
//           });
//           get().rotateStrikes(run);
//           get().changeOver();
//         },
//         updateBatsmanStats: (run) => {
//           set((state) => {
//             return {
//               activeBatters: [
//                 {
//                   ...state.activeBatters[0],
//                   runs: state.activeBatters[0].runs + run,
//                   balls: state.activeBatters[0].balls + 1,
//                   fours: run === 4 ? state.activeBatters[0].fours + 1 : state.activeBatters[0].fours,
//                   sixes: run === 6 ? state.activeBatters[0].sixes + 1 : state.activeBatters[0].sixes
//                 },
//                 { ...state.activeBatters[1] }
//               ]
//             }
//           });
//           get().rotateStrikes(run);
//         },
//         rotateStrikes: (run) => {
//           set((state) => {
//             if ((run % 2 !== 0 && state.currentOver.balls < 6) || (run % 2 === 0 && state.currentOver.balls === 6)) {
//               return {
//                 activeBatters: [
//                   { ...state.activeBatters[1] },
//                   { ...state.activeBatters[0] }
//                 ]
//               }
//             }
//             return state
//           })
//         },
//         updateBowlerStats: (validBall, run, wicket) => {
//           set((state) => {
//             let { balls, wickets, runs, overs, maidens } = state.activeBowler;
//             if (validBall) {
//               balls++;
//               if (balls >= 6) {
//                 balls = 0;
//                 overs++;
//                 if (state.currentOver.all.every(({ val }) => val === '0')) {
//                   maidens++;
//                 }
//               }
//             }
//             if (wicket) {
//               wickets++;
//             }
//             if (run > 0) {
//               runs += run;
//             }
//             return { activeBowler: { ...state.activeBowler, balls, runs, wickets, overs, maidens } }
//           })
//         },
//         addNewBowler: (bowlerName) => {
//           set((state) => {
//             const bowler = state.innings.at(0)?.bowlers.find(bowler => bowler.playerName === bowlerName);
//             return {
//               activeBowler: bowler ? bowler : { playerName: bowlerName, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 },
//               showBowlerDialog: false
//             }
//           })
//         },
//         startSecondInning: () => {
//           set((state) => {
//             return {
//               innings: [
//                 {
//                   ...state.innings[0],
//                   run: state.runs,
//                   overs: state.oversBowled,
//                   batters: [...state.innings[0].batters, ...state.activeBatters]
//                 },
//                 state.innings[1]],
//               runs: 0,
//               oversBowled: [],
//               activeInning: 1
//             }
//           })
//         },
//         checkResult: () => {
//           set((state) => {
//             if (state.activeInning !== 1) {
//               return state;
//             }
//             let isMatchFinished = false;
//             let description;
//             let matchWinner;
//             if (state.runs > state.innings[0].run) {
//               isMatchFinished = true;
//               description = 'Team 2 won by 6 wickets';
//               matchWinner = 'Team 2';
//             } else if (state.runs < state.innings[0].run && (state.oversBowled.length === state.overs || state.innings[1].wickets === MAX_WICKETS)) {
//               isMatchFinished = true;
//               description = 'Team 1 won by 6 runs';
//               matchWinner = 'Team 1';
//             }

//             if (!isMatchFinished) {
//               return state;
//             } else {
//               return {
//                 matchStatus: 'Finished',
//                 description,
//                 matchWinner
//               }
//             }
//           })
//         }
//       }),
//       { name: "scores" }
//     )
//   )
// );

export default useStore;
