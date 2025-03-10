import type { Grid } from "./Grid";

import Board from "./Board";
import Coordinates from "./Coordinates";
import { Mark } from "./Mark";
import { Transform } from "./Permutation";

let index = 1;

export default class Move {
  mark: Mark;

  prev: Board;
  next: Board;

  // indicates the row and column on previous board
  prevCoordinates: Coordinates;
  nextCoordinates: Coordinates;

  // indicates the row and column on the next board (after deduplication)
  nextRow: number;
  nextCol: number;

  index: number;

  constructor(board: Board, row: number, col: number, mark: Mark) {
    this.prev = board;

    this.prevCoordinates = new Coordinates(row, col);
    this.nextCoordinates = this.prevCoordinates;
    this.mark = mark;

    this.next = board.move(this);
  }

  apply(grid: Grid) {
    grid[this.prevCoordinates.row][this.prevCoordinates.col] = this.mark;
  }

  transform(transform: Transform) {
    this.nextCoordinates = transform.transformCoordinates(this.prevCoordinates);
  }

  svg(): string {
    return this.next.svg(this);
  }

  html(): string {
    return this.next.html(this);
  }

  recordIndex() {
    this.index = index++;
  }
}
