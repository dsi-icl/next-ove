import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../utils/api";
import { Power, PowerOff } from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@ove/ui-base-components";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const PowerControlForm = z.strictObject({
  confirmation: z.boolean(),
});

type PowerControlForm = z.infer<typeof PowerControlForm>;

const PowerControls = ({ bridgeId }: { bridgeId: string }) => {
  const [mode, setMode] = useState<"on" | "off" | null>(null);
  const [open, setOpen] = useState(false);
  const powerOn = api.hardware.startAll.useMutation({
    retry: false,
    onSuccess: () => toast.success("Successfully powered on"),
    onError: () => toast.error("Failed to power on"),
  });
  const powerOff = api.hardware.shutdownAll.useMutation({
    retry: false,
    onSuccess: () => toast.success("Successfully powered off"),
    onError: () => toast.error("Failed to power off"),
  });

  const form = useForm<PowerControlForm>({
    resolver: zodResolver(PowerControlForm),
  });

  const onSubmit = ({ confirmation }: PowerControlForm) => {
    if (!confirmation) return;
    if (mode === null) {
      toast.error("Unable to set power");
      return;
    }
    if (mode === "on") {
      powerOn.mutateAsync({ bridgeId });
    } else if (mode === "off") {
      powerOff.mutateAsync({ bridgeId });
    }
    setMode(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex">
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="w-1/2 grow basis-1/2 rounded-r-none"
            onClick={() => setMode("on")}
          >
            <Power className="mr-2 size-4" />
            Power On
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="w-1/2 grow basis-1/2 rounded-l-none"
            onClick={() => setMode("off")}
          >
            <PowerOff className="mr-2 size-4" />
            Power Off
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>Please confirm the action you are about to take.</DialogDescription>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col"
            >
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem className="mt-4 flex items-center space-y-0">
                    <FormLabel>
                      You are about to turn the Observatory on/off, please confirm:
                    </FormLabel>
                    <FormControl className="ml-1 mt-0">
                      <Checkbox
                        required={true}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button variant="default" type="submit" className="ml-auto mt-4">
                CONFIRM
              </Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PowerControls;
