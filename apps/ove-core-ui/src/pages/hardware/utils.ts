import { isError, type OVEException } from "@ove/ove-types";

export type HardwareID = {
  bridgeId: string;
} & ({ type: "single", deviceId: string } | { type: "multi", tags?: string[], deviceIds?: string[] });

export const formatIds = (responses: { deviceId: string }[]) =>
  responses.map(({ deviceId }) => deviceId).join(", ");

export const checkErrors = <T>(args: {
  data: {
    deviceId: string;
    response: T | OVEException;
  }[];
  onError: (
    responses: {
      deviceId: string;
      response: T | OVEException;
    }[],
  ) => void;
  onSuccess: () => void;
}) => {
  const failing: {
    deviceId: string;
    response: T | OVEException;
  }[] = [];

  args.data.forEach((response) => {
    if (isError(response.response)) {
      failing.push(response);
    }
  });

  if (failing.length === 0) {
    args.onSuccess();
  } else {
    args.onError(failing);
  }
};

export const format = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
    return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString(10);
  if (typeof value === "boolean") return value.toString();
  return JSON.stringify(value);
};
