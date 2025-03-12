import "./style.css";

import Turn from "./Turn";

let turn: Turn | null = new Turn();
let html = "";

while (turn) {
  html += turn.html();
  turn = turn.next();
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Tic Tac Toe</h1>
    ${[1, 3, 5, 7, 9]
      .map((i) => `<a href="#turn${i}">Turn ${i}</a>`)
      .join("\n")}
    ${html}
    </div>
`;
