import { api } from "../../../../utils/api";
import { Button } from "@ove/ui-base-components";
import React, { useCallback } from "react";
import { toast } from "sonner";

const useReconciliation = (bridgeId: string) => {
  const reconciliationStatus = api.bridge.getReconciliation.useQuery({
    bridgeId,
  });
  const apiUtils = api.useUtils();
  const startReconciliation = api.bridge.startReconciliation.useMutation({
    onSuccess: () => {
      toast.promise(
        apiUtils.bridge.getReconciliation.invalidate({ bridgeId }),
        {
          loading: "Updating reconciliation status...",
          success: "Successfully updated reconciliation status",
          error: "Failed to update reconciliation status",
        },
      );
    },
  });
  const stopReconciliation = api.bridge.stopReconciliation.useMutation({
    onSuccess: () => {
      toast.promise(
        apiUtils.bridge.getReconciliation.invalidate({ bridgeId }),
        {
          loading: "Updating reconciliation status...",
          success: "Successfully updated reconciliation status",
          error: "Failed to update reconciliation status",
        },
      );
    },
  });

  const start = useCallback(async () => {
    toast.promise(startReconciliation.mutateAsync({ bridgeId }), {
      loading: "Starting reconciliation...",
      success: "Successfully started reconciliation",
      error: "Failed to start reconciliation",
    });
  }, [startReconciliation, bridgeId]);

  const stop = useCallback(async () => {
    toast.promise(stopReconciliation.mutateAsync({ bridgeId }), {
      loading: "Stopping reconciliation...",
      error: "Failed to stop reconciliation",
      success: "Successfully stopped reconciliation",
    });
  }, [stopReconciliation, bridgeId]);

  return { status: reconciliationStatus.data ?? null, start, stop };
};

const Reconciliation = ({ bridgeId }: { bridgeId: string }) => {
  const { status, start, stop } = useReconciliation(bridgeId);

  return status !== null ? (
    <Button
      onClick={status ? stop : start}
      variant={status ? "destructive" : "default"}
    >
      {status ? "Stop Reconciliation" : "Start Reconciliation"}
    </Button>
  ) : null;
};

export default Reconciliation;
