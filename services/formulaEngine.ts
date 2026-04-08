export function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/\s+/g, '_');
}
