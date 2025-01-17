import { toast } from "sonner";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@ove/ui-base-components";
import { Leaf } from "lucide-react";
import React, { useMemo } from "react";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import { isError, type PowerMode } from "@ove/ove-types";

const usePowerMode = (bridgeId: string) => {
  const apiUtils = api.useUtils();
  const getPowerMode = api.bridge.getMode.useQuery({ bridgeId });
  const setPowerMode = api.bridge.setMode.useMutation({
    retry: false,
    onError: () => toast.error("Failed to set power mode"),
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to set power mode");
        return;
      }
      toast.success("Successfully set power mode");
      apiUtils.bridge.getMode.invalidate({ bridgeId }).catch(logger.error);
    }
  });
  const powerMode: PowerMode = useMemo(() => {
    if (getPowerMode.data === undefined || isError(getPowerMode.data.response)) return "manual";
    return getPowerMode.data.response;
  }, [getPowerMode.data]);

  return {
    powerMode, setPowerMode: (mode: PowerMode) => {
      setPowerMode.mutateAsync({ bridgeId, mode }).catch(logger.error);
    }
  };
};

const PowerMode = ({ bridgeId }: { bridgeId: string }) => {
  const { powerMode, setPowerMode } = usePowerMode(bridgeId);

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        <Leaf className="mr-2 h-4 w-4" />
        Set Power Mode
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuRadioGroup value={powerMode}
                              onValueChange={mode => setPowerMode(mode as PowerMode)}>
        <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="eco">Eco</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
};

export default PowerMode;
