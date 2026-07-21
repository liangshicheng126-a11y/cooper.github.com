export type MasonryPlacedItem<T> = {
  item: T;
  index: number;
};

export function getMasonryColumnCount(containerWidth: number): number {
  if (containerWidth >= 1600) return 6;
  if (containerWidth >= 1280) return 5;
  if (containerWidth >= 960) return 4;
  if (containerWidth >= 560) return 3;
  return 2;
}

const DEFAULT_ASPECT_RATIO = 3 / 4;

function estimateItemHeight(aspectRatio: number, columnWidth: number): number {
  const ratio = aspectRatio > 0 ? aspectRatio : DEFAULT_ASPECT_RATIO;
  return columnWidth / ratio;
}

function columnSpanHeight(itemHeights: number[], itemGap: number): number {
  if (itemHeights.length === 0) return 0;
  return itemHeights.reduce((sum, h) => sum + h, 0) + itemGap * (itemHeights.length - 1);
}

function shortestColumnIndex(heights: number[]): number {
  let target = 0;
  for (let c = 1; c < heights.length; c++) {
    if (heights[c] < heights[target]) target = c;
  }
  return target;
}

/**
 * After greedy packing, move/swap items between columns to shrink max−min height.
 * Keeps visual order within a column otherwise stable enough for masonry.
 */
function refineColumnBalance(
  columns: number[][],
  itemHeights: number[],
  itemGap: number,
): number[][] {
  const heights = columns.map((col) =>
    columnSpanHeight(
      col.map((i) => itemHeights[i]),
      itemGap,
    ),
  );

  let improved = true;
  let guard = 0;
  while (improved && guard++ < 400) {
    improved = false;
    const maxH = Math.max(...heights);
    const minH = Math.min(...heights);
    const spread = maxH - minH;
    if (spread < 2) break;

    const tall = heights.indexOf(maxH);
    const short = heights.indexOf(minH);

    // Prefer moving a single item from a tall column into a short one.
    for (let i = 0; i < columns[tall].length; i++) {
      const idx = columns[tall][i];
      const h = itemHeights[idx];
      const nextTall = columnSpanHeight(
        columns[tall]
          .filter((_, j) => j !== i)
          .map((k) => itemHeights[k]),
        itemGap,
      );
      const nextShort = columnSpanHeight(
        [...columns[short].map((k) => itemHeights[k]), h],
        itemGap,
      );
      const nextSpread = Math.max(nextTall, nextShort) - Math.min(nextTall, nextShort);
      if (nextSpread < spread - 0.5) {
        columns[tall].splice(i, 1);
        columns[short].push(idx);
        heights[tall] = nextTall;
        heights[short] = nextShort;
        improved = true;
        break;
      }
    }
    if (improved) continue;

    // Otherwise try pairwise swaps between the tallest and shortest columns.
    outer: for (let i = 0; i < columns[tall].length; i++) {
      for (let j = 0; j < columns[short].length; j++) {
        const a = columns[tall][i];
        const b = columns[short][j];
        const nextTallItems = columns[tall].map((k, n) => (n === i ? b : k));
        const nextShortItems = columns[short].map((k, n) => (n === j ? a : k));
        const nextTall = columnSpanHeight(
          nextTallItems.map((k) => itemHeights[k]),
          itemGap,
        );
        const nextShort = columnSpanHeight(
          nextShortItems.map((k) => itemHeights[k]),
          itemGap,
        );
        const nextSpread = Math.max(nextTall, nextShort) - Math.min(nextTall, nextShort);
        if (nextSpread < spread - 0.5) {
          columns[tall] = nextTallItems;
          columns[short] = nextShortItems;
          heights[tall] = nextTall;
          heights[short] = nextShort;
          improved = true;
          break outer;
        }
      }
    }
  }

  return columns;
}

/**
 * Shortest-column packing with tallest-first order, then local refine
 * so column bottoms stay as even as aspect-ratio variance allows.
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
  const safeColumnWidth = Math.max(columnWidth, 1);

  const indexed = items.map((item, index) => ({
    item,
    index,
    height: estimateItemHeight(getAspectRatio(item, index), safeColumnWidth),
  }));

  // Pack tall items first so portraits don't strand alone in a short column.
  indexed.sort((a, b) => b.height - a.height);

  const columns: number[][] = Array.from({ length: safeColumnCount }, () => []);
  const heights = new Array(safeColumnCount).fill(0);

  const heightByOriginalIndex = new Array(items.length);
  indexed.forEach((entry) => {
    heightByOriginalIndex[entry.index] = entry.height;
  });

  for (const entry of indexed) {
    const target = shortestColumnIndex(heights);
    const priorCount = columns[target].length;
    columns[target].push(entry.index);
    heights[target] += (priorCount > 0 ? itemGap : 0) + entry.height;
  }

  const refined = refineColumnBalance(columns, heightByOriginalIndex, itemGap);

  return refined.map((col) =>
    col.map((index) => ({
      item: items[index],
      index,
    })),
  );
}
