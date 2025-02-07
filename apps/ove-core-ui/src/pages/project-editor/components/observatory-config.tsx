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
  SelectValue
} from "@ove/ui-base-components";
import { useForm } from "react-hook-form";
import { useStore } from "../../../store";
import React, { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";
import { useObservatories, useObservatory } from "../../../hooks/observatories";

const SpaceConfigFormSchema = z.strictObject({
  observatory: z.string().optional()
});

type SpaceConfigForm = z.infer<typeof SpaceConfigFormSchema>

const ObservatoryConfig = () => {
  const observatories = useObservatories();
  const observatory = useObservatory();
  const setObservatory = useStore(state => state.setObservatory);
  const ref = useRef<HTMLFormElement | null>(null);
  const form = useForm<SpaceConfigForm>({
    defaultValues: {
      observatory: observatory.id ?? undefined
    },
    resolver: zodResolver(SpaceConfigFormSchema)
  });
  useFormErrorHandling(form.formState.errors);

  useEffect(() => {
    form.setValue("observatory", observatory.id ?? undefined);
  }, [form, observatory]);

  const onSubmit = (data: SpaceConfigForm) => {
    setObservatory(data.observatory ?? null);
  };

  return <section className="w-full h-full px-4">
    <Form {...form}>
      <form ref={ref} onSubmit={form.handleSubmit(onSubmit)}
            className="w-full">
        <FormField control={form.control} name="observatory"
                   render={({ field }) => <FormItem className="w-full flex flex-col mt-2">
                     <FormLabel
                       className="font-bold text-center w-full text-base">Observatory</FormLabel>
                     <Select {...field}>
                       <FormControl>
                         <SelectTrigger className="mt-6">
                           <SelectValue placeholder="Select an observatory" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent position="popper">
                         {Object.keys(observatories).map(name => <SelectItem
                           value={name} key={name}>{name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </FormItem>} />
      </form>
    </Form>
  </section>;
};

export default ObservatoryConfig;
