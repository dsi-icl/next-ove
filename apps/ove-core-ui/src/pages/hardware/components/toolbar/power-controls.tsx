import React from "react";
import { toast } from "sonner";
import { api } from "../../../../utils/api";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@ove/ui-base-components";

const PowerControls = ({ bridgeId }: { bridgeId: string }) => {
  const powerOn = api.hardware.startAll.useMutation({
    retry: false,
    onSuccess: () => toast.success("Successfully powered on"),
    onError: () => toast.error("Failed to power on")
  });
  const powerOff = api.hardware.shutdownAll.useMutation({
    retry: false,
    onSuccess: () => toast.success("Successfully powered off"),
    onError: () => toast.error("Failed to power off")
  });

  return <div className="flex">
    <Button variant="default"
            className="rounded-r-none w-[50%] grow basis-1/2"
            onClick={() => powerOn.mutateAsync({ bridgeId })}>
      <Power className="mr-2 h-4 w-4" />
      Power On
    </Button>
    <Button variant="destructive"
            className="rounded-l-none w-[50%] basis-1/2 grow"
            onClick={() => powerOff.mutateAsync({ bridgeId })}>
      <PowerOff className="mr-2 h-4 w-4" />
      Power Off
    </Button>
  </div>;
};

export default PowerControls;
