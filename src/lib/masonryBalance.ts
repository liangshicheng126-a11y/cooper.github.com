export type MasonryPlacedItem<T> = {
  item: T;
  index: number;
};

export function getMasonryColumnCount(viewportWidth: number): number {
  if (viewportWidth >= 1280) return 4;
  if (viewportWidth >= 768) return 3;
  return 2;
}

const DEFAULT_ASPECT_RATIO = 3 / 4;

/**
 * Greedy shortest-column packing using estimated item heights from aspect ratios.
 */
export function balanceMasonryColumns<T>(
  items: T[],
  columnCount: number,
  options: {
    getAspectRatio: (item: T, index: number) => number;
    columnWidth: number;
    itemGap?: number;
  },
): MasonryPlacedItem<T>[][] {
  const { getAspectRatio, columnWidth, itemGap = 12 } = options;
  const safeColumnCount = Math.max(1, columnCount);
  const columns: MasonryPlacedItem<T>[][] = Array.from({ length: safeColumnCount }, () => []);
  const heights = new Array(safeColumnCount).fill(0);
  const safeColumnWidth = Math.max(columnWidth, 1);

  items.forEach((item, index) => {
    const aspectRatio = getAspectRatio(item, index) || DEFAULT_ASPECT_RATIO;
    const itemHeight = safeColumnWidth / aspectRatio + itemGap;

    let targetColumn = 0;
    for (let c = 1; c < safeColumnCount; c++) {
      if (heights[c] < heights[targetColumn]) targetColumn = c;
    }

    columns[targetColumn].push({ item, index });
    heights[targetColumn] += itemHeight;
  });

  return columns;
}
