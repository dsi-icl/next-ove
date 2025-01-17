import { toast } from "sonner";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription, DialogHeader
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
import type { LaunchConfig } from "../../pages/project-editor/hooks";

const Controller = ({ config }: { config: LaunchConfig }) => {
  const apiUtils = api.useUtils();
  const controller = api.projects.getController.useQuery({
    ...config,
    layout: config.layout === null ? undefined : Json.stringify(config.layout)
  });
  const ref = useRef<HTMLIFrameElement | null>(null);
  const project = api.projects.getProject.useQuery({ projectId: config.projectId });
  const reloadBrowsers = api.hardware.reloadBrowsersAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to reload browsers");
        return;
      }
      checkErrors({
        data: response,
        onError: responses => toast.error(`Unable to reload browsers on ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully reloaded browsers")
      });
    },
    onError: () => toast.error("Unable to reload browsers")
  });
  const reload = useCallback(() => {
    reloadBrowsers.mutateAsync({bridgeId: config.observatory}).catch(logger.error);
    apiUtils.projects.getController.invalidate({...config, layout: config.layout === null ? undefined : Json.stringify(config.layout)}).catch(logger.error);
  }, [reloadBrowsers, config, apiUtils.projects.getController]);
  return <DialogContent
    className="max-w-[unset] w-[90%] h-[90%] m-0 p-0 border-none"
    hasClose={false}>
    <DialogHeader
      className="bg-[#002147] text-white h-12 items-center flex-row p-2 space-y-0 rounded-t-lg font-semibold">
      <DialogTitle
        className="ml-2">{project.status === "success" && !isError(project.data) && project.data !== null ? project.data.title : ""}</DialogTitle>
      <div className="ml-auto flex flex-row items-center h-full mt-0 mr-2">
        <Button variant="outline" className="mr-4 text-black" onClick={reload}>
          <RotateCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
        <DialogClose>
          <X className="h-4 w-4 mt-0" />
        </DialogClose>
      </div>
      <VisuallyHidden asChild>
        <DialogDescription>Terminal for remote control</DialogDescription>
      </VisuallyHidden>
    </DialogHeader>
    {controller.status === "success" && !isError(controller.data) ?
      <iframe ref={ref} title="controller"
              srcDoc={controller.data}></iframe> : null}
  </DialogContent>;
};

export default Controller;
