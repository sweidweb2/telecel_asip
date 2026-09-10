export type ListSortDir = "asc" | "desc";

export function parseListSortDir(raw: unknown): ListSortDir | undefined {
  if (raw === "asc" || raw === "desc") return raw;
  return undefined;
}

export function adminOrderAscending(dir: ListSortDir): boolean {
  return dir === "asc";
}
