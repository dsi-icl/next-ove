import React, { useEffect } from "react";
import { api } from "../../utils/api";
import { isError } from "@ove/ove-types";
import Observatory from "./components/observatory";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "../../env";

const HardwareManager = () => {
  const client = useQueryClient();
  const getObservatories = api.core.getObservatories.useQuery();

  useEffect(
    () => () => {
      client.cancelQueries({ queryKey: ["getStatus"] }).catch(logger.error);
      client.cancelQueries({ queryKey: ["screenshot"] }).catch(logger.error);
    },
    [client],
  );

  return (
    <main className="size-full">
      <h1 className="mt-4 w-full text-center text-2xl font-bold">
        Hardware Manager
      </h1>
      {getObservatories.status === "success" && !isError(getObservatories.data)
        ? getObservatories.data?.map(({ name, isOnline }) => (
            <Observatory name={name} isOnline={isOnline} key={name} />
          ))
        : null}
    </main>
  );
};

export default HardwareManager;
