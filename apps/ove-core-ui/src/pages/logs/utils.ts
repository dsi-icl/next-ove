export const formatDurationNs = (ns: number | string) => {
  const n = typeof ns === "string" ? Number(ns) : ns;
  return (n / 1e6).toFixed(2) + " ms";
};

export const shortId = (id: string) => id.slice(0, 8);

export const levelVariant = (level: string) => {
  switch (level.toUpperCase()) {
    case "ERROR":
      return "red";
    case "WARN":
      return "yellow";
    default:
      return "green";
  }
};
