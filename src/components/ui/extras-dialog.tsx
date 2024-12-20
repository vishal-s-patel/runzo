import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Button } from "./button";
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
} from "./form";
import { useState } from "react";

const formSchema = z.object({
  extraRun: z.number().min(0, "Run/s must be at least 0."),
});

function ExtrasDialog({ title, label }: { title: string; label: string }) {
  const { addExtra } = useStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      extraRun: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { extraRun } = values;
    if ((label === "LB" || label === "BYE") && extraRun === 0) {
      form.setError("extraRun", {
        message: "If extra is BYE or Leg Bye, min. run should be 1.",
      });
      return;
    }
    addExtra(extraRun, label);
    form.reset();
    setIsOpen(!isOpen);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="p-3 bg-slate-300 border text-gray-600 font-medium">
        {label}
      </DialogTrigger>
      <DialogContent className="w-11/12 rounded">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="extra-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="extraRun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extra runs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ExtrasDialog;
