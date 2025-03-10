import type { MarkOrEmpty } from "./Mark";

export type Grid = MarkOrEmpty[][];

export function gridsAreIdentical(grid1: Grid, grid2: Grid): boolean {
  return grid1.every((row, i) => row.every((mark, j) => mark === grid2[i][j]));
}
