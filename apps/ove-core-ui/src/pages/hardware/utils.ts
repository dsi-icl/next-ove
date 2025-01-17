import { isError, type OVEException } from "@ove/ove-types";

export const formatIds = (responses: {deviceId: string}[]) => responses.map(({deviceId}) => deviceId).join(", ");

export const checkErrors = <T>(args: {
  data: {
    deviceId: string,
    response: T | OVEException
  }[],
  onError: (responses: {
    deviceId: string,
    response: T | OVEException
  }[]) => void,
  onSuccess: () => void
}) => {
  const failing: {
    deviceId: string,
    response: T | OVEException
  }[] = [];

  args.data.forEach(response => {
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

export const getPages = (idx: number, max: number) => {
  if (idx === 0) {
    return [0, 1, 2].filter(v => v < max);
  } else if (idx === max) {
    return [max - 3, max - 2, max - 1].filter(v => v >= 0);
  }
  return [idx - 1, idx, idx + 1].filter(v => v < max && v >= 0);
};

export const format = (value: unknown) => {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString(10);
  if (typeof value === "boolean") return value.toString();
  return JSON.stringify(value);
};