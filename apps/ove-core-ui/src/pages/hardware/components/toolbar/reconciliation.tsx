import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import { Button } from "@ove/ui-base-components";
import React, { useCallback, useMemo } from "react";

const useReconciliation = (bridgeId: string) => {
  const reconciliationStatus = api.bridge.getReconciliation.useQuery({
    bridgeId,
  });
  const apiUtils = api.useUtils();
  const startReconciliation = api.bridge.startReconciliation.useMutation();
  const stopReconciliation = api.bridge.stopReconciliation.useMutation();

  const start = useCallback(async () => {
    await startReconciliation.mutateAsync({ bridgeId }).catch(logger.error);
    apiUtils.bridge.getReconciliation
      .invalidate({ bridgeId })
      .catch(logger.error);
  }, [startReconciliation, bridgeId, apiUtils.bridge.getReconciliation]);

  const stop = useCallback(async () => {
    await stopReconciliation.mutateAsync({ bridgeId }).catch(logger.error);
    apiUtils.bridge.getReconciliation
      .invalidate({ bridgeId })
      .catch(logger.error);
  }, [stopReconciliation, bridgeId, apiUtils.bridge.getReconciliation]);

  const status = useMemo(() => {
    if (
      reconciliationStatus.status !== "success" ||
      isError(reconciliationStatus.data.response)
    )
      return null;
    return reconciliationStatus.data.response;
  }, [reconciliationStatus.data?.response, reconciliationStatus.status]);

  return { status, start, stop };
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
