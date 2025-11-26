import { toast } from "sonner";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@ove/ui-base-components";
import { Leaf } from "lucide-react";
import React from "react";
import { api } from "../../../../utils/api";
import type { PowerMode as TPowerMode } from "@ove/ove-types";

const usePowerMode = (bridgeId: string) => {
  const apiUtils = api.useUtils();
  const getPowerMode = api.bridge.getMode.useQuery({ bridgeId });
  const setPowerMode = api.bridge.setMode.useMutation({
    retry: false,
    onSuccess: () => {
      toast.promise(apiUtils.bridge.getMode.invalidate({ bridgeId }), {
        loading: "Updating power mode...",
        success: "Successfully updated power mode",
        error: "Unable to update power mode",
      });
    },
  });

  return {
    powerMode: getPowerMode.data ?? "manual",
    setPowerMode: (mode: TPowerMode) => {
      toast.promise(setPowerMode.mutateAsync({ bridgeId, mode }), {
        loading: "Setting power mode...",
        success: "Successfully set power mode",
        error: "Failed to set power mode",
      });
    },
  };
};

const PowerMode = ({ bridgeId }: { bridgeId: string }) => {
  const { powerMode, setPowerMode } = usePowerMode(bridgeId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Leaf className="mr-2 size-4" />
          Set Power Mode
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={powerMode}
          onValueChange={(mode) => setPowerMode(mode as TPowerMode)}
        >
          <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="eco">Eco</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PowerMode;
