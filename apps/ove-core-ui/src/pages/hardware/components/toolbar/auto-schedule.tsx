import { z } from "zod";
import React, { useCallback, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormField,
  FormItem,
  FormLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { CalendarClock, X } from "lucide-react";
import { api } from "../../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";

const AutoModeFormSchema = z.strictObject({
  start: z.string().optional(),
  end: z.string().optional(),
  days: z.strictObject({value: z.boolean()}).array(),
});

type AutoModeForm = z.infer<typeof AutoModeFormSchema>;

const defaultDaySelection = [false, false, false, false, false, false, false];
const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AutoSchedule = ({ bridgeId } : { bridgeId: string }) => {
  const getAutoSchedule = api.bridge.getAutoSchedule.useQuery({ bridgeId });
  const currentSchedule = useMemo(() => {
    if (getAutoSchedule.status !== "success" || getAutoSchedule.data.response === undefined || isError(getAutoSchedule.data.response)) return undefined;
    return {
      start: getAutoSchedule.data.response.wake ?? "",
      end: getAutoSchedule.data.response.sleep ?? "",
      days: (getAutoSchedule.data.response.schedule ?? defaultDaySelection).map((day) => ({value: day})),
    }
  }, [getAutoSchedule.status, getAutoSchedule.data?.response]);
  const form = useForm<AutoModeForm>({
    resolver: zodResolver(AutoModeFormSchema),
    values: currentSchedule,
  });
  const { fields } = useFieldArray({
    name: "days",
    control: form.control,
  });
  const setAutoSchedule = api.bridge.setAutoSchedule.useMutation();
  useFormErrorHandling(form.formState.errors);
  const [open, setOpen] = useState(false);

  const onSubmit = useCallback(({ start, end, days }: AutoModeForm) => {
    setAutoSchedule.mutateAsync({
      bridgeId,
      autoSchedule: {
        wake: start ?? null,
        sleep: end ?? null,
        schedule: days.map((day) => day.value),
      }
    }).then(() => setOpen(false)).catch(() => toast.error("Unable to set auto schedule"));
  }, [setAutoSchedule, bridgeId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarClock className="mr-2 size-4" />
          Set Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auto Schedule</DialogTitle>
          <DialogDescription>
            Configure automatic power schedule
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField control={form.control} render={({ field }) => <FormItem>
              <FormLabel>Wake Time</FormLabel>
              <InputGroup>
                <InputGroupInput className="w-full block" {...field} type="time" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton onClick={() => form.setValue("start", undefined)}><X /></InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </FormItem>} name="start" />
            <FormField control={form.control} render={({ field }) => <FormItem className="mt-4">
              <FormLabel>Sleep Time</FormLabel>
              <InputGroup>
                <InputGroupInput className="w-full block" {...field} type="time" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton onClick={() => form.setValue("end", undefined)}><X /></InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </FormItem>} name="end" />
              <h2 className="text-sm font-medium mt-4">Days of Operation</h2>
              <div className="grid grid-cols-7 gap-2">
                {fields.map((field, index) => (
                  <FormField control={form.control} name={`days.${index}.value`} key={field.id} render={({field}) => <FormItem className="flex flex-col space-y-1 items-center">
                    <FormLabel>{names[index]}</FormLabel>
                    <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value)} />
                  </FormItem>} />
                ))}
              </div>
            <Button variant="default" type="submit" className="mt-4 w-full" disabled={form.formState.isSubmitting}>
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AutoSchedule;
