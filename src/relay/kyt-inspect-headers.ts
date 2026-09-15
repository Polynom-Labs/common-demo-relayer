export function kytInspectHeaders(
  inspectToken?: string,
): Record<string, string> {
  const token = inspectToken?.trim();
  return {
    "content-type": "application/json",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}
