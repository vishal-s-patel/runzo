import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import useWindowSize from "@/hooks/useWindowSize";
import Confetti from "react-confetti";
import useStore, { LOCAL_STORAGE_KEY } from "@/store";
import { Scorecard } from "@/components/features/ScorecardDialog";

export const PostMatch: React.FC = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const {present} = useStore();
  const {matchWinner, description} = present;
  function handleBackClick() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigate("/match-details")
  }
  return (
    <>
      <Confetti width={width} height={height} recycle={false} />
      <div className="flex items-center border-b">
        <Button onClick={handleBackClick} variant="ghost">
          <ChevronLeft /> Back
        </Button>
        <Scorecard />
      </div>
      <section className="flex items-center flex-col gap-2 h-[400px] justify-center">
        <h3 className="text-2xl">Congratulations</h3>
        <div className="p-5 rounded-full bg-green-700 w-[100px] h-[100px] flex items-center justify-center">
          <Trophy />
        </div>
        <h3 className="text-2xl">{matchWinner}</h3>
        <p>{description}</p>
      </section>
    </>
  );
};
