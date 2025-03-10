import Board from "./Board";
import { Mark } from "./Mark";

export default class Move {
  row: number;
  col: number;
  mark: Mark;

  prev: Board;
  next: Board;

  constructor(board: Board, row: number, col: number, mark: Mark) {
    this.prev = board;

    this.row = row;
    this.col = col;
    this.mark = mark;

    this.next = board.move(this);
  }

  svg(): string {
    return this.next.svg(this);
  }

  html(): string {
    return this.next.html(this);
  }
}
