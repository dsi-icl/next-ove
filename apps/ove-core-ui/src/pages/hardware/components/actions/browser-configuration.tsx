import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel, Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@ove/ui-base-components";
import React, { useCallback, useMemo, useState } from "react";
import { getPages } from "../../../../utils";
import { api } from "../../../../utils/api";
import { isError } from "@ove/ove-types";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const useBrowserConfiguration = (bridgeId: string, deviceId: string | null, tag?: string) => {
  const getBrowserConfig = api.hardware.getBrowserConfig.useQuery({bridgeId, deviceId: deviceId ?? "UNKNOWN"}, {enabled: deviceId !== null});
  const getBrowserConfigAll = api.hardware.getBrowserConfigAll.useQuery({bridgeId, tag}, {enabled: deviceId === null});

  const config = useMemo(() => {
    if (deviceId === null) {
      if (getBrowserConfigAll.status !== "success" || isError(getBrowserConfigAll.data.response)) return [];
      return getBrowserConfigAll.data.response;
    }

    if (getBrowserConfig.status !== "success" || isError(getBrowserConfig.data.response)) return [];
    return [{deviceId, response: getBrowserConfig.data.response}];
  }, [getBrowserConfig.status, getBrowserConfig.data?.response, getBrowserConfigAll.status, getBrowserConfigAll.data?.response, deviceId]);

  return {
    config
  };
};

type BrowserConfigurationProps = {
  deviceId: string | null;
  bridgeId: string;
  tag?: string;
  closeDialog: () => void;
};

const BrowserConfigurationForm = z.strictObject({urls: z.strictObject({value: z.string()}).array()});
type BrowserConfigurationForm = z.infer<typeof BrowserConfigurationForm>

const BrowserConfiguration = ({
  deviceId,
  bridgeId,
  tag,
  closeDialog,
}: BrowserConfigurationProps) => {
  const [idx, setIdx] = useState(0);
  const { config } = useBrowserConfiguration(bridgeId, deviceId, tag);
  const context = api.useUtils();
  const setBrowserConfig = api.hardware.setBrowserConfig.useMutation({
    onSuccess: () => {
      toast.success("Browser configuration updated successfully");
      if (deviceId !== null) {
        closeDialog();
      }
    },
    onError: () => {
      toast.error("Unable to set browser configuration");
      if (deviceId !== null) {
        closeDialog()
      }
    }
  });
  const form = useForm({
    values: {urls: isError(config.at(idx)?.response) ? [] : (config.at(idx)?.response as string[] | undefined)?.map((url) => ({value: url})) ?? []},
    resolver: zodResolver(BrowserConfigurationForm),
  });
  const { fields } = useFieldArray({
    name: "urls",
    control: form.control,
  });

  const onSubmit = useCallback(({urls}: BrowserConfigurationForm) => {
    const deviceId_ = config.at(idx)?.deviceId ?? null;
    if (deviceId_ === null) {
      toast.error("Unknown device");
      return;
    }
    setBrowserConfig.mutateAsync({ config: urls.map(({value}) => value), bridgeId, deviceId: deviceId_ }).then(() => {
      context.hardware.getBrowserConfig.invalidate({bridgeId, deviceId: deviceId_});
      context.hardware.getBrowserConfigAll.invalidate({bridgeId, tag});
    }).catch(() => {
      toast.error("Unable to set browser configuration");
      if (deviceId !== null) {
        closeDialog();
      }
    });
  }, [setBrowserConfig, bridgeId, config, idx, closeDialog, deviceId]);

  return (
    <DialogContent className="flex w-[70%] flex-col">
      <DialogHeader className="">
        <DialogTitle className="text-2xl font-bold">
          Browser Configuration - {isError(config.at(idx)?.response) ? "" : config.at(idx)?.deviceId ?? ""}
        </DialogTitle>
        <DialogDescription>Configure browsers</DialogDescription>
      </DialogHeader>
      <Form {...form}>
      <form className="h-[40vh] flex flex-col gap-4 overflow-y-scroll" onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <FormField control={form.control} name={`urls.${index}.value`} key={field.id} render={({field}) => <FormItem className="flex flex-col space-y-2">
            <FormLabel>Screen {index}</FormLabel>
            <Input {...field} />
          </FormItem>} />
        ))}
        <Button className="mt-auto" type="submit" variant="default">
          SUBMIT
        </Button>
      </form>
      </Form>
      <DialogFooter>
        {deviceId === null ? (
          <Pagination className="mb-6 mt-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setIdx((cur) => Math.max(cur - 1, 0))}
                />
              </PaginationItem>
              {getPages(idx, config.length).map((ix) => (
                <PaginationItem key={ix}>
                  <PaginationLink
                    isActive={idx === ix}
                    onClick={() => setIdx(ix)}
                  >
                    {ix}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setIdx((cur) => Math.min(cur + 1, config.length - 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </DialogFooter>
    </DialogContent>
  );
};

export default BrowserConfiguration;
