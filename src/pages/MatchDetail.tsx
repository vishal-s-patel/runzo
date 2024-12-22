import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router";
import useStore from "@/store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

const formSchema = z.object({
  team1: z.string().min(1, { message: "Team name is required." }),
  team2: z.string().min(1, { message: "Team name is required." }),
  tossWinner: z.string().min(1, { message: "Please select toss winner." }),
  decidedTo: z.enum(["bat", "field"], {
    required_error: "You need to select toss decision.",
  }),
  overs: z.number().min(1),
});

function MatchDetail() {
  const navigate = useNavigate();
  const { setMatchDetails, reset } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team1: "",
      team2: "",
      tossWinner: "",
      decidedTo: "bat",
      overs: 10,
    },
  });

  const team1 = form.watch().team1;
  const team2 = form.watch().team2;

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { team1, team2, tossWinner, decidedTo, overs } = values;
    setMatchDetails(team1, team2, tossWinner, decidedTo, overs);
    navigate("/player-details");
  }

  useEffect(() => {
    reset();
  }, []);

  return (
    <section>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
          <CardDescription>Please enter match details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="team1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Team 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="team2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Team 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tossWinner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toss won by?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={team1 || "Team 1"} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {team1 || "Team 1"}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={team2 || "Team 2"} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {team2 || "Team 2"}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="decidedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opted to?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="bat" />
                          </FormControl>
                          <FormLabel className="font-normal">Bat</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="field" />
                          </FormControl>
                          <FormLabel className="font-normal">Bowl</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overs</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10"
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button variant="ghost" type="button" className="w-1/2">
                  Advanced settings
                </Button>
                <Button type="submit" className="w-1/2">
                  Start match
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

export default MatchDetail;
