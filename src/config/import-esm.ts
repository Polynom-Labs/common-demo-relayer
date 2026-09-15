const loadEsm = new Function("specifier", "return import(specifier)") as <T>(
  specifier: string,
) => Promise<T>;

export function importEsm<T>(specifier: string): Promise<T> {
  return loadEsm<T>(specifier);
}
