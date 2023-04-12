export const Json = () => {
  const getDescendent = (input: string, obj: object): unknown => {
    if (!obj) {
      return undefined;
    }

    const nameSeparator = input.indexOf(".");

    if (nameSeparator === -1) {
      return obj[input as (keyof typeof obj)];
    }

    const newInput = input.substring(nameSeparator + 1);
    const newObj = obj[input.substring(0, nameSeparator) as keyof typeof obj];
    return getDescendent(newInput, newObj);
  };

  return {
    EMPTY: JSON.stringify({}),
    EMPTY_ARRAY: JSON.stringify([]),
    equals: (x: unknown, y: unknown): boolean => {
      return JSON.stringify(x) === JSON.stringify(y);
    },
    getDescendent: getDescendent
  };
};
