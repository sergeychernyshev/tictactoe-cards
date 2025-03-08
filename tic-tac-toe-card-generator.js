console.log(`
<html>
  <head>
  <title>Tic-tac-toe card generator</title>
  <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <h1>Tic-tac-toe card generator</h1>
    <p>
      <a href="#move1">Move 1</a>
      <a href="#move2">Move 2</a>
      <a href="#move3">Move 3</a>
      <a href="#move4">Move 4</a>
      <a href="#move5">Move 5</a>
      <a href="#move6">Move 6</a>
      <a href="#move7">Move 7</a>
      <a href="#move8">Move 8</a>
      <a href="#move9">Move 9</a>
    </p>
`);

let isX = true;

// array of states of the board in previous turn
let prevBoards = [
  [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ],
];

const boards = [[], [], [], [], [], [], [], [], []];

function addBoard(boards, board) {
  // board permutations
  const perms = [board];

  // rotate original board 3 times
  perms.push(rotateBoard(perms[perms.length - 1]));
  perms.push(rotateBoard(perms[perms.length - 1]));
  perms.push(rotateBoard(perms[perms.length - 1]));

  // flip original board and add 3 rotations of it
  perms.push(flipBoard(board));
  perms.push(rotateBoard(perms[perms.length - 1]));
  perms.push(rotateBoard(perms[perms.length - 1]));
  perms.push(rotateBoard(perms[perms.length - 1]));

  // compare each permutaion with original boards
  let boardIsNew = true;
  boards.forEach((prevBoard) => {
    perms.forEach((perm) => {
      if (compareBoards(prevBoard, perm)) {
        boardIsNew = false;
      }
    });
  });

  if (boardIsNew) {
    boards.push(board);
  }

  return boardIsNew;
}

// rotate board 90 degrees clockwise
function rotateBoard(board) {
  return [
    [board[2][0], board[1][0], board[0][0]],
    [board[2][1], board[1][1], board[0][1]],
    [board[2][2], board[1][2], board[0][2]],
  ];
}

// flip board horizontally
function flipBoard(board) {
  return [
    [board[0][2], board[0][1], board[0][0]],
    [board[1][2], board[1][1], board[1][0]],
    [board[2][2], board[2][1], board[2][0]],
  ];
}

function compareBoards(board1, board2) {
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      if (board1[row][column] !== board2[row][column]) {
        return false;
      }
    }
  }

  return true;
}

function printBoard(board) {
  const winnerClass = isWinnerBoard(board) ? "winner" : "";
  console.log(
    `<div class="board ${winnerClass}">
      <span>${board[0][0] || ""}</span>
      <span>${board[0][1] || ""}</span>
      <span>${board[0][2] || ""}</span>

      <span>${board[1][0] || ""}</span>
      <span>${board[1][1] || ""}</span>
      <span>${board[1][2] || ""}</span>
      
      <span>${board[2][0] || ""}</span>
      <span>${board[2][1] || ""}</span>
      <span>${board[2][2] || ""}</span>
    </div>`
  );
}

function isWinnerBoard(board) {
  const lines = [
    // rows
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // columns
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // diagonals
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];

  return lines.some(
    (line) =>
      line[0] !== undefined && line[0] === line[1] && line[0] === line[2]
  );
}

let boardIndex = 1;

for (let move = 0; move < 9; move++) {
  console.log(`<h2 id="move${move + 1}">Move ${move + 1}</h2>
    <section class="move">
  `);

  prevBoards
    .filter((board) => !isWinnerBoard(board))
    .forEach((prevBoard) => {
      console.log(`<div>`);
      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 3; column++) {
          const newBoard = prevBoard.map((row) => row.slice());

          if (newBoard[row][column] === undefined) {
            newBoard[row][column] = isX ? "X" : "O";

            if (addBoard(boards[move], newBoard)) {
              boardIndex++;
              printBoard(newBoard);
            }
          }
        }
      }
      console.log(`</div>`);
    });

  console.log(`
      <p>Total ${boards[move].length} unique boards in this move</p>
    </section>
  `);

  prevBoards = boards[move];

  isX = !isX;
}

console.log(`
  <p>Boards for X ${
    boards.filter((x, i) => i % 2 === 0).flat().length
  } unique boards</p>
  <p>Boards for O ${
    boards.filter((x, i) => i % 2 !== 0).flat().length
  } unique boards</p>

  </body>
</html>
`);
