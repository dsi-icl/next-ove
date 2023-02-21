// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols

export const oveUtils = (): string => 'ove-utils';
export const deepCopy = (obj: unknown): unknown => JSON.parse(JSON.stringify(obj));

// export const groupBy = (xs: object[], key: string) => xs.reduce((rv, x) => {
//   (rv[x[key]] = rv[x[key]] || []).push(x);
//   return rv;
// }, {});

export const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
  if (value === null || value === undefined) return false;
  // @ts-ignore
  const dummy: TValue = value;
  return true;
};
