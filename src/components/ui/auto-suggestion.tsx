import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useStore from "@/store";

interface AutoSuggestionProps {
  onBowlerChange: (bowler: string) => void;
}

const AutoSuggestion = ({ onBowlerChange }: AutoSuggestionProps) => {
  const { present } = useStore();
  const { innings, activeInning, activeBowler } = present;
  const [inputValue, setInputValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

  const handleAddItem = () => {
    if (newBowler.trim()) {
      setBowlers((prev) => [...prev, newBowler.trim()]);
      onBowlerChange(newBowler);
      setInputValue(newBowler);
      setIsOpen(false); // Close popover
    }
  };
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          {inputValue
            ? bowlers.find((bowler) => bowler === inputValue)
            : "Select bowler"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput
            placeholder="Select a new bowler"
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
                    setIsOpen(false);
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
      </PopoverContent>
    </Popover>
  );
};

export default AutoSuggestion;
