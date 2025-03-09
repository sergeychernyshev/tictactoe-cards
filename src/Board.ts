import type { Mark, MarkOrEmpty } from "./Mark";
import { X, O } from "./Mark";
import Move from "./Move";

const O_TURN_BACKGROUND = "yellow";
const X_TURN_BACKGROUND = "white";
const WINNING_BACKGROUND = "lightgreen";

export default class Board {
  grid: MarkOrEmpty[][];
  moves: Move[] = [];

  constructor(board?: MarkOrEmpty[][]) {
    if (typeof board === "undefined") {
      this.grid = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ];
    } else {
      this.grid = board;
    }
  }

  clone(): Board {
    const board = new Board();
    board.grid = this.grid.map((row) => row.slice());
    return board;
  }

  move(move: Move): Board {
    this.moves.push(move);

    const next = this.clone();
    next.grid[move.row][move.col] = move.mark;

    return next;
  }

  fillPossibleMoves(mark: Mark) {
    // no new moves in the games that were won
    if (this.isWinner()) {
      return;
    }

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        if (this.grid[row][column] === null) {
          new Move(this, row, column, mark);
        }
      }
    }

    // compare moves' next boards and remove duplicates
    this.moves = this.moves.filter((move, i, arr) => {
      return arr.findIndex((m) => m.next.compare(move.next)) === i;
    });
  }

  identical(board: Board): boolean {
    return this.grid.every((row, i) =>
      row.every((mark, j) => mark === board.grid[i][j])
    );
  }

  // rotate board 90 degrees clockwise
  rotate() {
    return new Board([
      [this.grid[2][0], this.grid[1][0], this.grid[0][0]],
      [this.grid[2][1], this.grid[1][1], this.grid[0][1]],
      [this.grid[2][2], this.grid[1][2], this.grid[0][2]],
    ]);
  }

  // flip board horizontally
  flip() {
    return new Board([
      [this.grid[0][2], this.grid[0][1], this.grid[0][0]],
      [this.grid[1][2], this.grid[1][1], this.grid[1][0]],
      [this.grid[2][2], this.grid[2][1], this.grid[2][0]],
    ]);
  }

  compare(board): boolean {
    // board permutations
    const perms: Board[] = [this];

    // rotate original board 3 times
    perms.push(perms[perms.length - 1].rotate());
    perms.push(perms[perms.length - 1].rotate());
    perms.push(perms[perms.length - 1].rotate());

    // flip original board and add 3 rotations of it
    perms.push(this.flip());
    perms.push(perms[perms.length - 1].rotate());
    perms.push(perms[perms.length - 1].rotate());
    perms.push(perms[perms.length - 1].rotate());

    // compare each permutaion of board1 with board2
    let identical = false;
    perms.forEach((perm) => {
      if (board.identical(perm)) {
        identical = true;
      }
    });

    return identical;
  }

  isWinner(): boolean {
    const lines = [
      // rows
      [this.grid[0][0], this.grid[0][1], this.grid[0][2]],
      [this.grid[1][0], this.grid[1][1], this.grid[1][2]],
      [this.grid[2][0], this.grid[2][1], this.grid[2][2]],
      // columns
      [this.grid[0][0], this.grid[1][0], this.grid[2][0]],
      [this.grid[0][1], this.grid[1][1], this.grid[2][1]],
      [this.grid[0][2], this.grid[1][2], this.grid[2][2]],
      // diagonals
      [this.grid[0][0], this.grid[1][1], this.grid[2][2]],
      [this.grid[0][2], this.grid[1][1], this.grid[2][0]],
    ];

    return lines.some(
      (line) => line[0] !== null && line[0] === line[1] && line[0] === line[2]
    );
  }

  html(): string {
    const winnerClass = this.isWinner() ? "winner" : "";
    return `<div class="board ${winnerClass}">
      <span>${this.grid[0][0] || ""}</span>
      <span>${this.grid[0][1] || ""}</span>
      <span>${this.grid[0][2] || ""}</span>

      <span>${this.grid[1][0] || ""}</span>
      <span>${this.grid[1][1] || ""}</span>
      <span>${this.grid[1][2] || ""}</span>

      <span>${this.grid[2][0] || ""}</span>
      <span>${this.grid[2][1] || ""}</span>
      <span>${this.grid[2][2] || ""}</span>
    </div>`;
  }

  svg(currentMove?: Move): string {
    let backgroundColor =
      (currentMove && currentMove.mark) === X
        ? X_TURN_BACKGROUND
        : O_TURN_BACKGROUND;

    if (this.isWinner()) {
      backgroundColor = WINNING_BACKGROUND;
    }

    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="300" height="300" fill="${backgroundColor}" stroke="black" stroke-width="4"/>
      <line x1="100" y1="0" x2="100" y2="300" stroke="black" stroke-width="2" />
      <line x1="200" y1="0" x2="200" y2="300" stroke="black" stroke-width="2" />
      <line x1="0" y1="100" x2="300" y2="100" stroke="black" stroke-width="2" />
      <line x1="0" y1="200" x2="300" y2="200" stroke="black" stroke-width="2" />
      ${this.grid
        .map((row, i) =>
          row
            .map((mark, j) => {
              let color = "black";

              if (
                currentMove &&
                currentMove.row === i &&
                currentMove.col === j
              ) {
                color = "blue";
              }

              if (mark === X) {
                return `<line x1="${(j + 1) * 100 - 80}" y1="${
                  (i + 1) * 100 - 80
                }" x2="${j * 100 + 80}" y2="${
                  i * 100 + 80
                }" stroke="${color}" stroke-width="20" />
                <line x1="${j * 100 + 80}" y1="${(i + 1) * 100 - 80}" x2="${
                  (j + 1) * 100 - 80
                }" y2="${i * 100 + 80}" stroke="${color}" stroke-width="20" />`;
              } else if (mark === O) {
                return `<circle cx="${j * 100 + 50}" cy="${
                  i * 100 + 50
                }" r="30" stroke="${color}" stroke-width="17" fill="none" />`;
              }
              return "";
            })
            .join("")
        )
        .join("")}
    </svg>`;
  }
}
