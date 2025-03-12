import Board from "./Board";

import { RIGHT_ARROW } from "./SVGHelper";

import { X, O } from "./Mark";
import type { Mark } from "./Mark";

export default class Turn {
  number: number;
  mark: Mark;
  boards: Board[];
  dedupedNextBoards: Board[];

  constructor(mark: Mark = X, boards?: Board[], number: number = 1) {
    if (typeof boards === "undefined") {
      boards = [Board.getEmptyBoard()];
    }

    this.mark = mark;
    this.boards = boards;
    this.number = number;

    boards.forEach((board) => board.fillPossibleMoves(mark));

    // collect all moves from all boards in previous round
    const nextMoves = boards.map((board) => board.moves).flat();

    // determine the resulting boards to start next round from
    const nextBoards = nextMoves
      .map((move) => move.next)
      .filter((b) => !b.transform && !b.isWinner());

    // different moves can produce same boards, don't count them twice
    this.dedupedNextBoards = nextBoards.filter(
      (board, i, arr) =>
        !board.isFull() && arr.findIndex((b) => b.compare(board)) === i
    );
  }

  next(): Turn | null {
    if (this.dedupedNextBoards.length === 0) {
      return null;
    } else {
      return new Turn(
        this.mark === X ? O : X,
        this.dedupedNextBoards,
        this.number + 1
      );
    }
  }

  get moves(): number {
    return this.boards
      .map((board) => board.moves.length)
      .reduce((a, b) => a + b);
  }

  html(): string {
    const moves = this.boards.map((board) => board.moves).flat();

    let html = `<h2 id="turn${this.number}">Turn ${this.number}</h2>
    <p>Board: ${this.moves}</p>`;

    html += this.boards
      .map(
        (board) => `<div class="move">
          ${board.html()}
          <div class="arrow">${RIGHT_ARROW}</div>
          ${board.moves.map((move) => move.html()).join("\n")}
          </div>`
      )
      .join("\n");

    return html;
  }
}
