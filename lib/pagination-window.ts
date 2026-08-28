/**
 * Builds a compact pagination window: first, last, current ± siblings, with ellipsis gaps.
 */
export type PaginationItem = number | "ellipsis";

export function getPaginationItems(
  current: number,
  total: number,
  siblingCount = 1,
): PaginationItem[] {
  if (total <= 1) return total === 1 ? [1] : [];

  const safeCurrent = Math.min(Math.max(1, current), total);
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let i = safeCurrent - siblingCount; i <= safeCurrent + siblingCount; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PaginationItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i]!;
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (page - prev === 2) {
        items.push(prev + 1);
      } else if (page - prev > 2) {
        items.push("ellipsis");
      }
    }
    items.push(page);
  }

  return items;
}
