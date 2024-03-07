import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { useForm } from "react-hook-form";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { ChevronRight, SendHorizontal } from "lucide-react";

import styles from "./console.module.scss";

const useConsole = (bridgeId: string, deviceId: string | null) => {
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);
  const execute = trpc.hardware.execute.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        addCommand(`${deviceId} > ERROR`);
        return;
      }

      addCommand(`${deviceId} > ${response.response}`);
    },
    onError: () => toast.error("Unable to execute command")
  });
  const executeAll = trpc.hardware.executeAll.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        addCommand(`${bridgeId} > ERROR`);
        return;
      }

      response.forEach(({ deviceId, response }) => {
        if ("response" in response) {
          addCommand(`${deviceId} > ${response.response}`);
        } else {
          addCommand(`${deviceId} > ERROR`);
        }
      });
    },
    onError: () => addCommand(`${bridgeId} > ERROR`)
  });

  if (deviceId === null) {
    return {
      execute: ({ command, reset }: { command: string, reset: () => void }) => {
        addCommand(`${deviceId ?? bridgeId} ~ ${command}`);
        executeAll.mutateAsync({ bridgeId, command }).catch(logger.error);
        reset();
      }
    };
  }

  return {
    execute: ({ command, reset }: { command: string, reset: () => void }) => {
      addCommand(`${deviceId ?? bridgeId} ~ ${command}`);
      execute.mutateAsync({
        bridgeId,
        deviceId,
        command
      }).catch(logger.error);
      reset();
    }
  };
};

const Line = ({ text, consoleId }: { text: string, consoleId: string }) => {
  return <li>
    {text.startsWith(consoleId) ? <ChevronRight size="0.8rem" /> : null}
    <p>{text}</p>
  </li>;
};

const Console = ({ bridgeId, deviceId }: {
  bridgeId: string
  deviceId: string | null,
}) => {
  const commandHistory = useStore(state => state.hardwareConfig.commandHistory);
  const { register, reset, handleSubmit } = useForm<{ command: string }>();
  const { execute } = useConsole(bridgeId, deviceId);

  return <div className={styles.console}>
    <h4>Console - {deviceId ?? bridgeId}</h4>
    <ul>
      {commandHistory.map((line, i) => <Line key={`${line}-${i}`}
                                             consoleId={deviceId ?? bridgeId}
                                             text={line} />)}
    </ul>
    <form onSubmit={handleSubmit(({ command }) => execute({ reset, command }))}>
      <p><span>$</span>{deviceId ?? bridgeId} ~ </p>
      <input {...register("command", { required: true })} autoComplete="off"
             type="text" />
      <button type="submit"><SendHorizontal /></button>
    </form>
  </div>;
};

export default Console;
