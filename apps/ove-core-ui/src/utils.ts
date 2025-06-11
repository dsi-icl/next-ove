export type InfoTypes = "general" | "system" | "cpu" | "memory";

export const getPages = (idx: number, max: number) => {
  if (idx === 0) {
    return [0, 1, 2].filter((v) => v < max);
  } else if (idx === max) {
    return [max - 3, max - 2, max - 1].filter((v) => v >= 0);
  }
  return [idx - 1, idx, idx + 1].filter((v) => v < max && v >= 0);
};
