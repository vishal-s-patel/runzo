import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useStore from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

const formSchema = z.object({
  striker: z.string().min(1, "Batsman name is required."),
  nonStriker: z.string().min(1, "Batsman name is required."),
  bowler: z.string().min(1, "Bowler name is required."),
});

function PlayerDetail() {
  const {
    setOpeningPlayers,
    present,
    // startSecondInning,
    // innings,
    // oversBowled,
    // overs,
  } = useStore();

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      striker: "",
      nonStriker: "",
      bowler: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { striker, nonStriker, bowler } = values;
    setOpeningPlayers(striker, nonStriker, bowler);
    // if (overs === oversBowled.length || innings[0].wickets === 10) {
    //   startSecondInning();
    // }
    navigate(`/match`);
  }

  return (
    <section>
      <div className="flex items-center">
        <Button size="icon" variant="ghost">
          <Link to={present.activeInning === 0 ? "/match-details" : "/match"}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="inline-block ms-5">Select opening players</h1>
      </div>
      <Card className="mx-4 my-2 pt-3">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="striker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Striker</FormLabel>
                    <FormControl>
                      <Input placeholder="player name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nonStriker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Non-striker</FormLabel>
                    <FormControl>
                      <Input placeholder="player name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bowler"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening bowler</FormLabel>
                    <FormControl>
                      <Input placeholder="Bowler name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full mt-3" type="submit">
                Start match
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

export default PlayerDetail;
