/**
 * Stacked columns (the VSCO-style grid) computed on the server.
 *
 * Items are dropped one by one into the column that is currently shortest, so
 * reading order is preserved as closely as possible while the columns stay
 * level. Each tile keeps its native aspect ratio; heights are tracked in
 * "column widths" (1 / ratio) so the result is independent of the pixel width.
 */
export type ColumnItem<T> = { item: T; ratio: number; index: number };

export function layoutColumns<T>(items: Array<{ item: T; ratio: number }>, columns: number): ColumnItem<T>[][] {
  const n = Math.max(1, columns);
  const cols: ColumnItem<T>[][] = Array.from({ length: n }, () => []);
  const heights = new Array<number>(n).fill(0);
  items.forEach(({ item, ratio }, index) => {
    const r = Math.max(0.3, Math.min(4, ratio || 1));
    let c = 0;
    for (let i = 1; i < n; i++) if (heights[i] < heights[c] - 1e-6) c = i;
    cols[c].push({ item, ratio: r, index });
    heights[c] += 1 / r;
  });
  return cols;
}
