import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import useStore from "@/store";

interface DialogProps {
  showDialog: boolean;
  setShowDialog: () => void;
  overs: number;
  teamName: string;
  runs: number;
}

export const EndInningDialog: React.FC<DialogProps> = ({
  showDialog,
  setShowDialog,
}) => {
  const navigate = useNavigate();
  const { present } = useStore();
  const { innings, overs, secondInnTeamName } = present;

  if (innings.length === 0) return null;

  function handleOk() {
    setShowDialog();
    navigate("/player-details");
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="w-11/12 rounded">
        <DialogHeader>
          <DialogTitle className="text-left">
            End of the first inning
          </DialogTitle>
        </DialogHeader>
        <p>{`${secondInnTeamName} need ${
          innings[0].runs + 1
        } runs in ${overs} overs.`}</p>
        <p>Required Run Rate: {(innings[0].runs + 1) / overs}</p>
        <DialogFooter className="flex flex-row gap-1 justify-end">
          <Button variant="ghost" className="w-20" onClick={setShowDialog}>
            Cancel
          </Button>
          <Button className="w-20" onClick={handleOk}>
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
