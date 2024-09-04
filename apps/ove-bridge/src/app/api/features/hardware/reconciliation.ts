import { env, logger } from "apps/ove-bridge/src/env";
import { service } from "./reconciliation-service";

let interval: NodeJS.Timeout | null = null;

const reconcile = async () => {
  service.cancel();
  service.update();
  await Promise.all(env.HARDWARE.flatMap(device => {
    const callbacks: Promise<void>[] = [];

    switch (device.type) {
      case "node": {
        callbacks.push(service.reconcileStatus(device));
        callbacks.push(service.reconcileBrowsers(device));
        callbacks.push(service.reconcileWindowConfig(device));
        break;
      }
      case "mdc": {
        callbacks.push(service.reconcileStatus(device));
        callbacks.push(service.reconcileIsMuted(device));
        callbacks.push(service.reconcileVolume(device));
        callbacks.push(service.reconcileSource(device));
        break;
      }
      case "pjlink": {
        callbacks.push(service.reconcileStatus(device));
        callbacks.push(service.reconcileSource(device));
        callbacks.push(service.reconcileIsMuted(device));
        callbacks.push(service.reconcileIsAudioMuted(device));
        callbacks.push(service.reconcileIsVideoMuted(device));
      }
    }

    return callbacks;
  }));
};

export const startReconciliation = () => {
  logger.info("Starting reconciliation");

  if (interval !== null) throw new Error("Reconciliation already in progress");
  service.init();
  interval = setInterval(reconcile, env.RECONCILIATION_TIMEOUT);
};

export const stopReconciliation = () => {
  logger.info("Stopping reconciliation");

  if (interval === null) throw new Error("Reconciliation already stopped");
  service.cancel();
  clearInterval(interval);
  interval = null;
};