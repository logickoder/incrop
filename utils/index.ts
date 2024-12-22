export function getSafely<T extends object>(object: T, key: string) {
  // @ts-expect-error directly using string as key can cause typescript issues
  return Object.prototype.hasOwnProperty.call(object, key) ? object[key] : undefined;
}

export function setStyle(element: HTMLDivElement | null, styles: Record<string, string>) {
  if (!element) return;
  Object.entries(styles).forEach(([key, value]) => {
    // @ts-expect-error just typescript complaining again
    element.style[key] = value;
  });
}
