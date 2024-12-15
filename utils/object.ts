export function getSafely<T extends object>(object: T, key: string) {
  // @ts-expect-error directly using string as key can cause typescript issues
  return Object.prototype.hasOwnProperty.call(object, key) ? object[key] : undefined;
}