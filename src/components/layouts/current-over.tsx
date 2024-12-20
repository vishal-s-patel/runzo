import useStore from "@/store";
import { Card, CardContent } from "../ui/card";
import clsx from "clsx";

function ThisOver() {
  const { present } = useStore();
  const { currentOver } = present;
  return (
    <Card className="m-2">
      <CardContent className="p-1 flex items-center h-12">
        <h6 className="text-base w-15 flex-shrink-0">This over:</h6>
        <div className="overflow-x-auto p-1 flex">
          {currentOver.length > 0 &&
            currentOver.map((ball, i) => (
              <div className="flex flex-col items-center" key={"B" + i}>
                <div
                  className={clsx(
                    "relative mx-1 flex flex-shrink-0 h-6 w-6 items-center justify-center rounded text-xs font-medium",
                    ball.val === "4" && "bg-green-600 text-white",
                    ball.val === "6" && "bg-purple-700 text-white",
                    ball.val.includes("W") && "bg-red-500 text-white",
                    ball.val !== "4" &&
                    ball.val !== "6" &&
                    !ball.val.includes("W") && "bg-gray-100 text-black"
                  )}
                >
                  {ball.val}
                </div>
                <span className="block text-[8px]">{ball.extra}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ThisOver;
