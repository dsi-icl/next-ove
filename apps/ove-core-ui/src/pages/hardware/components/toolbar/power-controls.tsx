import React from "react";
import { toast } from "sonner";
import { api } from "../../../../utils/api";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@ove/ui-base-components";

const PowerControls = ({ bridgeId }: { bridgeId: string }) => {
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

  return (
    <div className="flex">
      <Button
        variant="default"
        className="w-1/2 grow basis-1/2 rounded-r-none"
        onClick={() => powerOn.mutateAsync({ bridgeId })}
      >
        <Power className="mr-2 size-4" />
        Power On
      </Button>
      <Button
        variant="destructive"
        className="w-1/2 grow basis-1/2 rounded-l-none"
        onClick={() => powerOff.mutateAsync({ bridgeId })}
      >
        <PowerOff className="mr-2 size-4" />
        Power Off
      </Button>
    </div>
  );
};

export default PowerControls;
