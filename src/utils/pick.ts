/**
 * Pick specified keys from an object
 * @param obj Object to pick keys from
 * @param keys Array of keys to pick
 * @returns Object containing only picked keys
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<Pick<T, K>> => {
  const finalObj: Partial<Pick<T, K>> = {};

  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }

  return finalObj;
};

export default pick;
