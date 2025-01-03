import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import useStore from "@/store";

interface AutoSuggestionProps {
  onBowlerChange: (bowler: string) => void;
}

const AutoSuggestion = ({ onBowlerChange }: AutoSuggestionProps) => {
  const { present } = useStore();
  const { innings, activeInning, activeBowler } = present;
  const [inputValue, setInputValue] = useState<string>("");
  const [newBowler, setNewBowler] = useState<string>("");
  const [bowlers, setBowlers] = useState<Array<string>>(
    () =>
      innings
        .at(activeInning)
        ?.bowlers.filter(
          (bowler) => bowler.playerName !== activeBowler.playerName
        )
        .map((bowler) => bowler.playerName) || []
  );
  const [error, setError] = useState<string>("");

  const handleAddItem = () => {
    if (
      innings[activeInning].bowlers.findIndex(
        ({ playerName }) => playerName === newBowler.trim()
      ) !== -1
    ) {
      setError("Bowler already exists!");
      return;
    }
    if (newBowler.trim()) {
      setBowlers((prev) => [...prev, newBowler.trim()]);
      onBowlerChange(newBowler);
      setInputValue(newBowler);
    }
  };
  return (
    // <Popover open={isOpen} onOpenChange={setIsOpen}>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant="outline"
    //       role="combobox"
    //       aria-expanded={isOpen}
    //       className="w-full justify-between"
    //     >
    //       {inputValue
    //         ? bowlers.find((bowler) => bowler === inputValue)
    //         : "Select bowler"}
    //       <ChevronsUpDown className="opacity-50" />
    //     </Button>
    //   </PopoverTrigger>
    //   <PopoverContent>
    <>
      <Command className="h-40">
        <CommandInput
          placeholder={"Type/Select a new bowler"}
          value={newBowler}
          onValueChange={setNewBowler}
        ></CommandInput>
        <CommandList>
          {newBowler && (
            <CommandEmpty onClick={() => handleAddItem()}>
              Add "{newBowler}"
            </CommandEmpty>
          )}
          <CommandGroup>
            {bowlers.map((bowler) => (
              <CommandItem
                key={bowler}
                value={bowler}
                onSelect={(currentValue) => {
                  setInputValue(
                    currentValue === inputValue ? "" : currentValue
                  );
                  onBowlerChange(bowler);
                }}
              >
                {bowler}
                <Check
                  className={cn(
                    "ml-auto",
                    inputValue === bowler ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="text-sm text-red-500">{error}</p>
    </>
    //   </PopoverContent>
    // </Popover>
  );
};

export default AutoSuggestion;
