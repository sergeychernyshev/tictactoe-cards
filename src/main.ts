import "./style.css";

import Board from "./Board";
import { X, O } from "./Mark";
import type { Mark } from "./Mark";

import { RIGHT_ARROW } from "./SVGHelper";

const start = Board.getEmptyBoard();

let mark: Mark = X;
start.fillPossibleMoves(mark);

console.log(start);

let turn = 1;

function turnHTML(boards: Board[]): string {
  const moves = boards.map((board) => board.moves).flat();

  let html = "";

  html += `<h2 id="turn${turn}">Turn ${turn}</h2>`;

  html += boards
    .map(
      (board) => `<div class="move">
      ${board.html()}
      <div class="arrow">${RIGHT_ARROW}</div>
      ${board.moves.map((move) => move.html()).join("\n")}
    </div>`
    )
    .join("\n");

  turn++;

  // collect all moves from all boards in previous round
  const nextMoves = boards.map((board) => board.moves).flat();

  // determine the resulting boards to start next round from
  const nextBoards = nextMoves
    .map((move) => move.next)
    .filter((b) => !b.isWinner());

  // different moves can produce same boards, don't count them twice
  const dedupedNextBoards = nextBoards.filter(
    (board, i, arr) => arr.findIndex((b) => b.compare(board)) === i
  );

  if (dedupedNextBoards.length !== 0) {
    mark = mark === X ? O : X;

    dedupedNextBoards.forEach((board) => board.fillPossibleMoves(mark));
  }

  if (dedupedNextBoards.map((board) => board.moves).flat().length > 0) {
    html += turnHTML(dedupedNextBoards);
  }

  return html;
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Tic Tac Toe</h1>
    ${[1, 3, 5, 7, 9]
      .map((i) => `<a href="#turn${i}">Turn ${i}</a>`)
      .join("\n")}
    
    ${turnHTML([start])}
    </div>
`;
