import { z } from "zod";
import React from "react";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { useForm } from "react-hook-form";
import { api } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, SendHorizontal } from "lucide-react";

import styles from "./console.module.scss";

const useConsole = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);
  const execute = api.hardware.execute.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        addCommand(`${deviceId} > ERROR`);
        return;
      }

      addCommand(`${deviceId} > ${response.response}`);
    },
    onError: () => toast.error("Unable to execute command")
  });
  const executeAll = api.hardware.executeAll.useMutation({
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
        executeAll.mutateAsync({
          bridgeId,
          command,
          tag
        }).catch(logger.error);
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

const ConsoleFormSchema = z.strictObject({
  command: z.string()
});

type ConsoleForm = z.infer<typeof ConsoleFormSchema>

const Console = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const consoleId = deviceAction.deviceId ?? assert(deviceAction.bridgeId);
  const commandHistory = useStore(state => state.hardwareConfig.commandHistory);
  const { register, reset, handleSubmit } = useForm<ConsoleForm>({
    resolver: zodResolver(ConsoleFormSchema)
  });
  const { execute } = useConsole(
    assert(deviceAction.bridgeId), deviceAction.deviceId, deviceAction.tag);

  return <div className={styles.console}>
    <h4>Console - {consoleId}</h4>
    <ul>
      {commandHistory.map((line, i) => <Line key={`${line}-${i}`}
                                             consoleId={consoleId}
                                             text={line} />)}
    </ul>
    <form onSubmit={handleSubmit(({ command }) => execute({ reset, command }))}>
      <p><span>$</span>{consoleId} ~ </p>
      <input {...register("command", { required: true })} autoComplete="off"
             type="text" />
      <button type="submit"><SendHorizontal /></button>
    </form>
  </div>;
};

export default Console;
