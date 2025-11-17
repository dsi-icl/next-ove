import { toast } from "sonner";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@ove/ui-base-components";
import { logger } from "../../env";
import { Json } from "@ove/ove-utils";
import { api } from "../../utils/api";
import { isError } from "@ove/ove-types";
import { RotateCw, X } from "lucide-react";
import React, { useCallback, useRef } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { checkErrors, formatIds } from "../../pages/hardware/utils";
import type { TLaunchConfig } from "../launch-config/launch-config";

const Controller = ({ config }: { config: TLaunchConfig }) => {
  const apiUtils = api.useUtils();
  const controller = api.projects.getController.useQuery({
    ...config,
    layout: config.layout === null ? undefined : Json.stringify(config.layout),
  });
  const ref = useRef<HTMLIFrameElement | null>(null);
  const project = api.projects.getProject.useQuery({
    projectId: config.projectId,
  });
  const reloadBrowsers = api.hardware.reloadBrowsersAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to reload browsers");
        return;
      }
      checkErrors({
        data: response,
        onError: (responses) =>
          toast.error(`Unable to reload browsers on ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully reloaded browsers"),
      });
    },
    onError: () => toast.error("Unable to reload browsers"),
  });
  const reload = useCallback(() => {
    reloadBrowsers
      .mutateAsync({ bridgeId: config.observatory })
      .catch(logger.error);
    apiUtils.projects.getController
      .invalidate({
        ...config,
        layout:
          config.layout === null ? undefined : Json.stringify(config.layout),
      })
      .catch(logger.error);
  }, [reloadBrowsers, config, apiUtils.projects.getController]);
  return (
    <DialogContent
      className="m-0 size-[90%] max-w-[unset] block border-none p-0"
      hasClose={false}
    >
      <DialogHeader className="h-12 flex-row items-center space-y-0 rounded-t-lg bg-[#002147] p-2 font-semibold text-white">
        <DialogTitle className="ml-2">
          {project.status === "success" &&
          !isError(project.data) &&
          project.data !== null
            ? project.data.title
            : ""}
        </DialogTitle>
        <div className="ml-auto mr-2 mt-0 flex h-full flex-row items-center">
          <Button
            variant="outline"
            className="mr-4 text-black"
            onClick={reload}
          >
            <RotateCw className="mr-2 size-4" />
            Reload
          </Button>
          <DialogClose>
            <X className="mt-0 size-4" />
          </DialogClose>
        </div>
        <VisuallyHidden asChild>
          <DialogDescription>Terminal for remote control</DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      {controller.status === "success" && !isError(controller.data) ? (
        <iframe className="size-full" ref={ref} title="controller" srcDoc={controller.data}></iframe>
      ) : null}
    </DialogContent>
  );
};

export default Controller;
