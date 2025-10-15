import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { useForm } from "react-hook-form";
import { useStore } from "../../../store";
import React, { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useObservatories, useObservatory } from "../../../hooks/observatories";

const SpaceConfigFormSchema = z.strictObject({
  observatory: z.string().optional(),
});

type SpaceConfigForm = z.infer<typeof SpaceConfigFormSchema>;

const ObservatoryConfig = () => {
  const observatories = useObservatories();
  const observatory = useObservatory();
  const setObservatory = useStore((state) => state.setObservatory);
  const ref = useRef<HTMLFormElement | null>(null);
  const form = useForm<SpaceConfigForm>({
    defaultValues: {
      observatory: observatory.id ?? "",
    },
    resolver: zodResolver(SpaceConfigFormSchema),
  });
  useFormErrorHandling(form.formState.errors);

  useEffect(() => {
    form.setValue("observatory", observatory.id ?? "");
  }, [form, observatory]);

  const onSubmit = (data: SpaceConfigForm) => {
    setObservatory(data.observatory ?? null);
  };

  return (
    <section className="size-full px-4">
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full"
        >
          <FormField
            control={form.control}
            name="observatory"
            render={({ field }) => (
              <FormItem className="mt-2 flex w-full flex-col">
                <FormLabel className="w-full text-center text-base font-bold">
                  Observatory
                </FormLabel>
                <Select {...field}>
                  <FormControl>
                    <SelectTrigger className="mt-6">
                      <SelectValue placeholder="Select an observatory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper">
                    {Object.keys(observatories).map((name) => (
                      <SelectItem value={name} key={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </section>
  );
};

export default ObservatoryConfig;
