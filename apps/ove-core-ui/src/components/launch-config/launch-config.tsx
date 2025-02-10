import { z } from "zod";
import React from "react";
import {
  Button,
  Checkbox,
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
  SelectValue,
} from "@ove/ui-base-components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Project, Section } from "@prisma/client";
import { useObservatories } from "../../hooks/observatories";
import { useSectionStore } from "../../pages/project-editor/hooks/stores";

export type TLaunchConfig = {
  projectId: string;
  observatory: string;
  layout: Section[] | null;
};

type LaunchConfigProps = {
  launch: (config: TLaunchConfig) => void;
  project: Project;
};

const LaunchConfigFormSchema = z.strictObject({
  observatory: z.string(),
  confirmation: z.boolean(),
});

type LaunchConfigForm = z.infer<typeof LaunchConfigFormSchema>;

const LaunchConfig = ({ project, launch }: LaunchConfigProps) => {
  const observatories = useObservatories();
  const sections = useSectionStore((state) => state.sections);

  const form = useForm<LaunchConfigForm>({
    resolver: zodResolver(LaunchConfigFormSchema),
  });

  const onSubmit = ({ observatory, confirmation }: LaunchConfigForm) => {
    if (!confirmation) return;
    launch({
      projectId: project.id,
      observatory,
      layout: sections.length === 0 ? null : sections,
    });
  };

  return (
    <DialogContent className="w-[25vw]">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Launch Config</DialogTitle>
        <DialogDescription>
          Select the observatory to launch into and confirm your intent
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col"
        >
          <FormField
            control={form.control}
            name="observatory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Observatory:</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an observatory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper">
                    {Object.keys(observatories).map((k) => (
                      <SelectItem className="cursor-pointer" key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem className="mt-4 flex items-center space-y-0">
                <FormLabel>
                  This observatory may be in use, please confirm:
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
          <Button variant="default" className="ml-auto mt-4">
            LAUNCH
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
};

export default LaunchConfig;
