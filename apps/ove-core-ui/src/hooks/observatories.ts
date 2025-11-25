import { api } from "../utils/api";
import { useStore } from "../store";

export const useObservatories = () => {
  const getObservatories = api.core.getObservatoryBounds.useQuery();
  return getObservatories.status !== "success" ? {} : getObservatories.data;
};

export const useObservatory = () => {
  const observatories = useObservatories();
  const observatory = useStore(state => state.observatory);

  const key = observatory ?? Object.keys(observatories).at(0) ?? null;

  return {
    id: key,
    bounds: observatories?.[key ?? "ERROR"] ?? null
  };
};
