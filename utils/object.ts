export function getSafely<T extends object, K extends keyof T>(object: T, key: K): T[K] | undefined {
  return Object.prototype.hasOwnProperty.call(object, key) ? object[key] : undefined;
}