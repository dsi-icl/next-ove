import { z } from "zod";
import React from "react";
import {
  Button, Checkbox,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import type {
  LaunchConfig as LaunchConfigT
} from "../../pages/project-editor/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Project, Section } from "@prisma/client";

type LaunchConfigProps = {
  observatories: string[]
  launch: (config: LaunchConfigT) => void
  project: Project,
  sections: Section[] | null
}

const LaunchConfigFormSchema = z.strictObject({
  observatory: z.string(),
  confirmation: z.boolean()
});

type LaunchConfigForm = z.infer<typeof LaunchConfigFormSchema>

const LaunchConfig = ({
  project,
  observatories,
  launch,
  sections
}: LaunchConfigProps) => {
  const form = useForm<LaunchConfigForm>({
    resolver: zodResolver(LaunchConfigFormSchema)
  });

  const onSubmit = ({ observatory, confirmation }: LaunchConfigForm) => {
    if (!confirmation) return;
    launch({ projectId: project.id, observatory, layout: sections });
  };

  return <DialogContent className="w-[25vw]">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">Launch Config</DialogTitle>
      <DialogDescription>Select the observatory to launch into and confirm your
        intent</DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col">
        <FormField control={form.control} name="observatory"
                   render={({ field }) => <FormItem>
                     <FormLabel
                       className="font-semibold">Observatory:</FormLabel>
                     <Select onValueChange={field.onChange}
                             defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select an observatory" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent position="popper">
                         {observatories.map(k => <SelectItem className="cursor-pointer" key={k}
                                                             value={k}>{k}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </FormItem>} />
        <FormField control={form.control} name="confirmation"
                   render={({ field }) => <FormItem className="space-y-0 mt-4 items-center flex">
                     <FormLabel>This observatory may be in use, please
                       confirm:</FormLabel>
                     <FormControl className="ml-1 mt-0">
                       <Checkbox
                         required={true}
                         checked={field.value}
                         onCheckedChange={field.onChange}
                       />
                     </FormControl>
                   </FormItem>} />
        <Button variant="default" className="mt-4 ml-auto">LAUNCH</Button>
      </form>
    </Form>
  </DialogContent>;
};

export default LaunchConfig;
