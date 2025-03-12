import type { Mark, MarkOrEmpty } from "./Mark";
import { X, O } from "./Mark";
import Move from "./Move";

import type { Grid } from "./Grid";
import { Transform, TRANSFORMS } from "./Transform";

const O_TURN_BACKGROUND = "yellow";
const X_TURN_BACKGROUND = "white";
const WINNING_BACKGROUND = "lightgreen";

// private key to use in the constructor
const PRIVATE_KEY = Symbol();

let index = 0;

const boards = new Map<string, Board>();

export default class Board {
  grid: Grid;
  moves: Move[] = [];
  index: number;

  base: Board;
  transform: Transform | undefined;
  visited: boolean = false;

  constructor(key: symbol, grid, base?: Board, transform?: Transform) {
    if (key !== PRIVATE_KEY) {
      throw new Error(
        "Use Board.get() to create a new board, or start with Board.getEmptyBoard()"
      );
    }

    this.index = transform ? 0 : index++;
    this.grid = grid;

    if (typeof base === "undefined") {
      this.base = this;
    } else {
      this.base = base;
    }

    this.transform = transform;

    boards.set(this.key, this);
  }

  static getEmptyBoard() {
    return Board.get([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  }

  // singleton to manage identical boards, also updates the move if grid is permutated
  static get(grid: Grid): Board {
    // find the board with exactly the same grid
    let board: Board | undefined = boards.get(Board.idFromGrid(grid));

    if (typeof board === "undefined") {
      board = new Board(PRIVATE_KEY, grid);

      board.createAllVariations();
    }

    return board;
  }

  createAllVariations() {
    // TODO generate all permutations of the grid and add them to the map
    TRANSFORMS.forEach((transform) => {
      const transformedGrid = transform.transformGrid(this.grid);

      if (!boards.get(Board.idFromGrid(transformedGrid))) {
        new Board(PRIVATE_KEY, transformedGrid, this, transform);
      }
    });
  }

  static idFromGrid(grid: Grid): string {
    return grid
      .flat()
      .map((mark) => (mark ? mark : "."))
      .join("");
  }

  get key(): string {
    return Board.idFromGrid(this.grid);
  }

  get id(): string {
    if (this.transform) {
      return `${this.base?.id}-${this.transform.slug}`;
    } else {
      return this.index.toString();
    }
  }

  get name(): string {
    return `#${this.id}`;
  }

  move(move: Move): Board {
    this.moves.push(move);

    const nextGrid = this.grid.map((row) => row.slice());
    move.apply(nextGrid);

    // TODO fix a bug with move not matching the next board as the existing board got rotated
    // it shows the wrong move on the display board right now

    // if grid was originally differet, rotate the move accordingly

    const board = Board.get(nextGrid);
    return board;
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
      return arr.findIndex((m) => m.next.base.compare(move.next.base)) === i;
    });

    this.moves.forEach((move) => move.recordIndex());
  }

  compare(board: Board): boolean {
    return this.key === board.key;
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

  html(move?: Move): string {
    const idAttribute = move ? "" : `id="board${this.base.id}"`;

    let title = "";

    if (move) {
      title = `<span>Move ${move.index}</span> to`;
    }

    if (move && !this.isWinner() && !this.isFull()) {
      title += `<span><a href="#board${this.base.id}">${this.name}</a></span>`;
    } else {
      title += `<span>${this.name}</span>`;
    }

    return `<section class="board" ${idAttribute}>
      <header>${title}</header>
      <div>
        ${this.svg(move)}
      </div>
    </section>`;
  }

  svg(currentMove?: Move): string {
    let backgroundColor =
      currentMove && currentMove.mark ? X_TURN_BACKGROUND : O_TURN_BACKGROUND;

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
                currentMove.nextCoordinates.row === i &&
                currentMove.nextCoordinates.col === j
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
