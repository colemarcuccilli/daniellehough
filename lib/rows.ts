/**
 * Justified row layout computed on the server.
 *
 * Photos are partitioned into rows so that the sum of aspect ratios in each row
 * is close to `target` (container width ÷ desired row height). Inside a row
 * every tile gets `flex: ratio 1 0%`, so widths are proportional to ratios and
 * all tiles in the row share one height, at any container width, with no
 * cropping and no layout shift. A last row that is much shorter than the
 * target is sized as if it were full, so it never balloons.
 */
export type RowItem<T> = { item: T; ratio: number; index: number };
export type RowLayout<T> = { rows: RowItem<T>[][]; target: number; shortLast: boolean };

export const ROW_TARGETS = { mobile: 1.5, desktop: 3.4 } as const;

export function layoutRows<T>(items: Array<{ item: T; ratio: number }>, target: number): RowLayout<T> {
  const rows: RowItem<T>[][] = [];
  let row: RowItem<T>[] = [];
  let sum = 0;
  items.forEach(({ item, ratio }, index) => {
    const r = Math.max(0.2, Math.min(5, ratio || 1));
    if (row.length > 0 && sum + r > target) {
      const withIt = Math.abs(sum + r - target);
      const withoutIt = Math.abs(sum - target);
      if (withIt < withoutIt) {
        row.push({ item, ratio: r, index });
        rows.push(row);
        row = [];
        sum = 0;
        return;
      }
      rows.push(row);
      row = [];
      sum = 0;
    }
    row.push({ item, ratio: r, index });
    sum += r;
  });
  if (row.length) rows.push(row);
  const last = rows[rows.length - 1] ?? [];
  const lastSum = last.reduce((a, b) => a + b.ratio, 0);
  return { rows, target, shortLast: rows.length > 0 && lastSum < target * 0.72 };
}

/** Fraction of the container width a tile occupies in its row. */
export function tileFraction<T>(row: RowItem<T>[], ratio: number, target: number, short: boolean) {
  const sum = short ? target : row.reduce((a, b) => a + b.ratio, 0);
  return ratio / sum;
}

/** `sizes` attribute for next/image given the tile's fraction of the viewport. */
export function sizesFor(fraction: number, contained?: number) {
  const vw = Math.max(5, Math.round(fraction * 100));
  if (contained) return `(min-width: ${contained}px) ${Math.round(contained * fraction)}px, ${vw}vw`;
  return `${vw}vw`;
}
