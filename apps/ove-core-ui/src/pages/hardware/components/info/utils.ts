export const format = (value: unknown) => {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString(10);
  if (typeof value === "boolean") return value.toString();
  return JSON.stringify(value);
};