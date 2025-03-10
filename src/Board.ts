import type { Mark, MarkOrEmpty } from "./Mark";
import { X, O } from "./Mark";
import Move from "./Move";

import type { Grid } from "./Grid";
import { getGridId, rotatedGrid, flippedGrid, gridsAreIdentical } from "./Grid";

const O_TURN_BACKGROUND = "yellow";
const X_TURN_BACKGROUND = "white";
const WINNING_BACKGROUND = "lightgreen";

// private key to use in the constructor
const PRIVATE_KEY = Symbol();

let index = 0;

const boards: Board[] = [];

export default class Board {
  grid: Grid;
  moves: Move[] = [];
  index: number;

  constructor(key: symbol, grid) {
    if (key !== PRIVATE_KEY) {
      throw new Error(
        "Use Board.get() to create a new board, or start with Board.getEmptyBoard()"
      );
    }

    this.index = index++;
    this.grid = grid;
  }

  static getEmptyBoard() {
    return Board.get([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  }

  // singleton to manage identical boards
  static get(grid: Grid): Board {
    let board: Board | undefined = boards.find((b) => b.compareGrid(grid));

    if (typeof board === "undefined") {
      board = new Board(PRIVATE_KEY, grid);
      boards.push(board);
    }

    return board;
  }

  move(move: Move): Board {
    this.moves.push(move);

    const nextGrid = this.grid.map((row) => row.slice());
    nextGrid[move.row][move.col] = move.mark;

    // TODO fix a bug with move not matching the next board as the existing board got rotated
    // it shows the wrong move on the display board right now

    return Board.get(nextGrid);
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

  compareGrid(grid: Grid): boolean {
    // board permutations
    const perms: Grid[] = [this.grid];

    // rotate original board 3 times
    perms.push(rotatedGrid(perms[perms.length - 1]));
    perms.push(rotatedGrid(perms[perms.length - 1]));
    perms.push(rotatedGrid(perms[perms.length - 1]));

    // flip original board and add 3 rotations of it
    perms.push(flippedGrid(this.grid));
    perms.push(rotatedGrid(perms[perms.length - 1]));
    perms.push(rotatedGrid(perms[perms.length - 1]));
    perms.push(rotatedGrid(perms[perms.length - 1]));

    // compare each permutaion of board1 with board2
    let identical = perms.some((perm) => gridsAreIdentical(grid, perm));

    return identical;
  }

  compare(board: Board): boolean {
    return this.compareGrid(board.grid);
  }

  isFull(): boolean {
    return this.grid.every((row) => row.every((cell) => cell !== null));
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

  html(currentMove?: Move): string {
    const idAttribute = currentMove ? "" : `id="board${this.index}"`;
    const boardTitle =
      currentMove && !this.isWinner() && !this.isFull()
        ? `<a href="#board${this.index}">Board ${this.index}</a>`
        : `Board ${this.index}`;

    return `<div class="board" ${idAttribute}>
    <p>${boardTitle}</p>
    <div>
      ${this.svg(currentMove)}
    </div>
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
