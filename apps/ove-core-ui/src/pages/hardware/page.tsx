import React from "react";
import { api } from "../../utils/api";
import { isError } from "@ove/ove-types";
import Observatory from "./components/observatory";

const HardwareManager = () => {
  const getObservatories = api.core.getObservatories.useQuery();

  return <main className="w-full h-full">
    <h1 className="font-bold mt-4 text-2xl w-full text-center">Hardware Manager</h1>
    {getObservatories.status === "success" &&
    !isError(getObservatories.data) ?
      getObservatories.data?.map(({ name, isOnline }) =>
        <Observatory name={name} isOnline={isOnline} key={name} />) : null}
  </main>;
};

export default HardwareManager;
