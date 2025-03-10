import type { MarkOrEmpty } from "./Mark";

export type Grid = MarkOrEmpty[][];

export function getGridId(grid: Grid): string {
  return grid
    .flat()
    .map((n) => (n ? n : "_"))
    .join("");
}

// rotate board 90 degrees clockwise
export function rotatedGrid(grid: Grid): Grid {
  return [
    [grid[2][0], grid[1][0], grid[0][0]],
    [grid[2][1], grid[1][1], grid[0][1]],
    [grid[2][2], grid[1][2], grid[0][2]],
  ];
}

// flip board horizontally
export function flippedGrid(grid: Grid): Grid {
  return [
    [grid[0][2], grid[0][1], grid[0][0]],
    [grid[1][2], grid[1][1], grid[1][0]],
    [grid[2][2], grid[2][1], grid[2][0]],
  ];
}

export function gridsAreIdentical(grid1: Grid, grid2: Grid): boolean {
  return grid1.every((row, i) => row.every((mark, j) => mark === grid2[i][j]));
}
