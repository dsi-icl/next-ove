export type HardwareID = {
  bridgeId: string;
} & (
  | { type: "single"; deviceId: string }
  | { type: "multi"; tags?: string[]; deviceIds?: string[] }
);

export const formatIds = (responses: { deviceId: string }[]) =>
  responses.map(({ deviceId }) => deviceId).join(", ");

export const getFailingDevices = <T>(
  responses: {
    deviceId: string;
    response:
      | { status: "success"; data: T }
      | { status: "error"; error: string };
  }[],
) =>
  responses
    .filter(({ response }) => response.status === "error")
    .map(({ deviceId }) => deviceId);

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
