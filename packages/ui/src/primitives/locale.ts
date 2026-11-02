/** The locale when neither a component nor a LocaleProvider sets one, so a page reads the same everywhere. */
export const defaultLocale = "en-US";

const isGroup = (value: unknown): value is object => typeof value === "object" && value !== null;

/**
 * Labels in layers, later ones winning key by key: a component's defaults, then
 * its LocaleProviders', then its own. A group of labels inside, like Table's
 * `filter`, merges the same way instead of being replaced whole. Undefined
 * keeps what came before.
 */
export function mergeLabels(...layers: (object | undefined)[]) {
  const merged: Record<string, unknown> = {};
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer ?? {})) {
      if (value === undefined) continue;
      merged[key] = isGroup(value) && isGroup(merged[key]) ? { ...merged[key], ...value } : value;
    }
  }
  return merged;
}
