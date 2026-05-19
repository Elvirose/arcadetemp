// ================================================================
// TIC TAC TOE
// ================================================================
let tttBoard = [],
  tttRoundsWon = 0,
  tttGameActive = false,
  tttPoints = 0,
  tttRestarted = false;
const TTT_ROUND_PTS = [0, 100, 150, 190];

function initTTT() {
  stopVoice();
  tttRoundsWon = 0;
  tttPoints = 0;
  tttRestarted = false;
  resetTTT();
  showScreen("ttt-screen", true);
  showCompanion("Beat the bot!");
  updateTTTRounds();
  //setTimeout(() => playVoice('ttt_audio'), 400);
}

function resetTTT() {
  tttBoard = Array(9).fill("");
  tttGameActive = true;
  renderTTT();
  document.getElementById("ttt-status").textContent = "YOUR TURN — Place X";
}

function restartTTT() {
  // User pressed restart — mark as restarted
  tttRestarted = true;
  gameState.challengeRestarted[1] = true;
  tttRoundsWon = 0;
  tttPoints = 0;
  resetTTT();
  updateTTTRounds();
}

function renderTTT() {
  const cells = document.querySelectorAll(".ttt-cell");
  cells.forEach((c, i) => {
    c.textContent = tttBoard[i];
    c.style.color =
      tttBoard[i] === "X" ? "#ff2d78" : tttBoard[i] === "O" ? "#00e5ff" : "";
    c.style.textShadow = tttBoard[i]
      ? `0 0 20px ${tttBoard[i] === "X" ? "#ff2d78" : "#00e5ff"}`
      : "";
  });
}
function updateTTTRounds() {
  document.getElementById("ttt-rounds").textContent =
    `ROUND: ${tttRoundsWon}/3`;
}
function tttClick(i) {
  playClickSound();
  if (!tttGameActive || tttBoard[i]) return;
  tttBoard[i] = "X";
  renderTTT();
  const win = checkTTT(tttBoard);
  if (win === "X") {
    tttGameActive = false;
    tttRoundsWon++;
    const rp = TTT_ROUND_PTS[tttRoundsWon] || 0;
    tttPoints += rp;
    updateTTTRounds();
    document.getElementById("ttt-status").textContent =
      `🎉 ROUND ${tttRoundsWon} WIN! +${rp} PTS`;
    spawnParticles();
    playYey();
    if (tttRoundsWon >= 3) {
      setTimeout(() => completeChallenge(1, tttPoints), 1500);
      return;
    }
    setTimeout(resetTTT, 2000);
    return;
  }
  if (win === "draw") {
    document.getElementById("ttt-status").textContent = "DRAW! Try again.";
    setTimeout(resetTTT, 1500);
    return;
  }
  setTimeout(botMove, 600);
}
function botMove() {
  const empty = tttBoard
    .map((v, i) => (v === "" ? i : null))
    .filter((v) => v !== null);
  if (!empty.length) return;
  tttBoard[empty[Math.floor(Math.random() * empty.length)]] = "O";
  renderTTT();
  const win = checkTTT(tttBoard);
  if (win === "O") {
    tttGameActive = false;
    document.getElementById("ttt-status").textContent =
      "😱 BOT WON! Restarting...";
    tttRoundsWon = 0;
    tttRestarted = true;
    gameState.challengeRestarted[1] = true;
    updateTTTRounds();
    setTimeout(resetTTT, 1500);
    return;
  }
  if (win === "draw") {
    document.getElementById("ttt-status").textContent = "DRAW! Try again.";
    setTimeout(resetTTT, 1200);
    return;
  }
  document.getElementById("ttt-status").textContent = "YOUR TURN — Place X";
}
function checkTTT(b) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, c, d] of lines)
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  if (b.every((v) => v)) return "draw";
  return null;
}

// ================================================================
// WORD SEARCH
// ================================================================
const WS_WORDS = [
  "HAPPY",
  "SMILE",
  "CHEKA",
  "ANSON",
  "BIRTHDAY",
  "CHOTTU",
  "AMMA",
  "APPA",
  "UNNIE",
  "APPU",
  "MWONU",
  "CARLO",
  "VJCET",
  "SPIRTE",
];
const WS_MAX_HINTS = 5;
let wsNoHintsMode = false;
let wsGrid = [],
  wsSize = 14,
  wsFound = [],
  wsSelecting = false,
  wsStartCell = null,
  wsSelectedCells = [],
  wsTimer = 0,
  wsTimerInterval = null,
  wsHintsUsed = 0,
  wsRestarted = false;

function initWS() {
  wsFound = [];
  wsHintsUsed = wsNoHintsMode ? WS_MAX_HINTS : 0;
  wsGrid = generateWSGrid();
  wsTimer = 0;
  wsRestarted = false;
  if (wsTimerInterval) clearInterval(wsTimerInterval);
  wsTimerInterval = setInterval(() => {
    wsTimer++;
    updateWSTimer();
  }, 1000);
  renderWSGrid();
  renderWSWords();
  updateWSHintUI();
  showScreen("ws-screen", true);
  showCompanion("Find all the words!");
  //setTimeout(() => playVoice('ws_audio'), 400);
}

function updateWSHintUI() {
  const btn = document.getElementById("ws-hint-btn");
  const counter = document.getElementById("ws-hint-count");
  const remaining = WS_MAX_HINTS - wsHintsUsed;
  counter.textContent =
    remaining + " hint" + (remaining !== 1 ? "s" : "") + " left";
  counter.className = remaining <= 1 ? "danger" : "";
  if (remaining <= 0) {
    btn.disabled = true;
    btn.textContent = "💡 NO HINTS LEFT";
  } else {
    btn.disabled = false;
    btn.textContent = "💡 HINT";
  }
}

function wsUseHint() {
  if (wsHintsUsed >= WS_MAX_HINTS) return;
  wsHintsUsed++;
  updateWSHintUI();
  if (wsHintsUsed >= WS_MAX_HINTS) {
    wsNoHintsMode = true;
    showCompanion("💀 No more hints! Restarting!");
    setTimeout(() => {
      clearInterval(wsTimerInterval);
      wsRestarted = true;
      gameState.challengeRestarted[2] = true;
      initWS();
    }, 1200);
    return;
  }
  const rem = WS_WORDS.filter((w) => !wsFound.includes(w));
  if (rem.length === 0) return;
  const hw = rem[Math.floor(Math.random() * rem.length)];
  const p = wsGrid._placed.find((p) => p.word === hw);
  if (p) {
    showCompanion(`💡 "${hw}" starts near row ${p.cells[0][0] + 1}!`);
    drawWSHintLine(p.cells);
  }
}

function updateWSTimer() {
  const m = String(Math.floor(wsTimer / 60)).padStart(2, "0"),
    s = String(wsTimer % 60).padStart(2, "0");
  document.getElementById("ws-timer").textContent = `⏱ ${m}:${s}`;
}
function generateWSGrid() {
  const grid = Array(wsSize)
    .fill(null)
    .map(() => Array(wsSize).fill(""));
  const placed = [],
    dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [-1, 1],
      [0, -1],
      [-1, 0],
      [-1, -1],
      [1, -1],
    ];
  for (const word of WS_WORDS) {
    let ok = false,
      tries = 0;
    while (!ok && tries < 1000) {
      tries++;
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * wsSize),
        c = Math.floor(Math.random() * wsSize);
      const cells = [];
      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dir[0] * i,
          nc = c + dir[1] * i;
        if (nr < 0 || nr >= wsSize || nc < 0 || nc >= wsSize) {
          valid = false;
          break;
        }
        if (grid[nr][nc] && grid[nr][nc] !== word[i]) {
          valid = false;
          break;
        }
        cells.push([nr, nc]);
      }
      if (valid) {
        cells.forEach(([nr, nc], i) => {
          grid[nr][nc] = word[i];
        });
        placed.push({ word, cells });
        ok = true;
      }
    }
  }
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < wsSize; r++)
    for (let c = 0; c < wsSize; c++)
      if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * 26)];
  grid._placed = placed;
  return grid;
}
function renderWSGrid() {
  const container = document.getElementById("ws-grid");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${wsSize},1fr)`;
  for (let r = 0; r < wsSize; r++)
    for (let c = 0; c < wsSize; c++) {
      const cell = document.createElement("div");
      cell.className = "ws-cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = wsGrid[r][c];
      cell.addEventListener("mousedown", wsStartSel);
      cell.addEventListener("mouseover", wsMoveSel);
      cell.addEventListener("mouseup", wsEndSel);
      cell.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          wsStartSel.call(cell, e);
        },
        { passive: false },
      );
      cell.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
          const t = e.touches[0];
          const el = document.elementFromPoint(t.clientX, t.clientY);
          if (el && el.classList.contains("ws-cell")) wsMoveSel.call(el, e);
        },
        { passive: false },
      );
      cell.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          wsEndSel.call(cell, e);
        },
        { passive: false },
      );
      container.appendChild(cell);
    }
  wsFound.forEach((word) => {
    const p = wsGrid._placed.find((pl) => pl.word === word);
    if (p)
      p.cells.forEach(([r, c]) => {
        const el = container.querySelector(`[data-r="${r}"][data-c="${c}"]`);
        if (el) el.classList.add("found");
      });
  });
}
function wsStartSel(e) {
  playClickSound();
  wsSelecting = true;
  wsStartCell = this;
  wsSelectedCells = [this];
  this.classList.add("selected");
}
function wsMoveSel(e) {
  if (!wsSelecting) return;
  document.querySelectorAll(".ws-cell").forEach((c) => {
    if (!c.classList.contains("found")) c.classList.remove("selected");
  });
  const r1 = +wsStartCell.dataset.r,
    c1 = +wsStartCell.dataset.c,
    r2 = +this.dataset.r,
    c2 = +this.dataset.c;
  wsSelectedCells = [];
  const dr = r2 - r1,
    dc = c2 - c1,
    steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) {
    wsSelectedCells = [wsStartCell];
    wsStartCell.classList.add("selected");
    return;
  }
  const sr = dr === 0 ? 0 : dr > 0 ? 1 : -1,
    sc = dc === 0 ? 0 : dc > 0 ? 1 : -1;
  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc))
    return;
  for (let i = 0; i <= steps; i++) {
    const el = document.querySelector(
      `[data-r="${r1 + sr * i}"][data-c="${c1 + sc * i}"]`,
    );
    if (el) {
      wsSelectedCells.push(el);
      el.classList.add("selected");
    }
  }
}
function wsEndSel(e) {
  playClickSound();
  if (!wsSelecting) return;
  wsSelecting = false;
  const word = wsSelectedCells.map((c) => c.textContent).join(""),
    wordRev = word.split("").reverse().join("");
  const match = WS_WORDS.find((w) => w === word || w === wordRev);
  if (match && !wsFound.includes(match)) {
    wsFound.push(match);
    wsSelectedCells.forEach((c) => c.classList.add("found"));
    renderWSWords();
    showCompanion(`Found: ${match}! 🎉`);
    playYey();
    if (wsFound.length >= WS_WORDS.length) {
      clearInterval(wsTimerInterval);
      showCompanion("🎉 ALL WORDS FOUND!");
      setTimeout(() => completeChallenge(2, 440), 1000);
    }
  } else {
    wsSelectedCells.forEach((c) => {
      if (!c.classList.contains("found")) c.classList.remove("selected");
    });
  }
  wsSelectedCells = [];
}
function renderWSWords() {
  document.getElementById("ws-words").innerHTML = WS_WORDS.map(
    (w) =>
      `<div class="ws-word ${wsFound.includes(w) ? "found" : ""}">${w}</div>`,
  ).join("");
}
function drawWSHintLine(cells) {
  const grid = document.getElementById("ws-grid");
  const first = document.querySelector(
    `[data-r="${cells[0][0]}"][data-c="${cells[0][1]}"]`,
  );
  const last = document.querySelector(
    `[data-r="${cells[cells.length - 1][0]}"][data-c="${cells[cells.length - 1][1]}"]`,
  );
  if (!first || !last) return;
  const gr = grid.getBoundingClientRect(),
    r1 = first.getBoundingClientRect(),
    r2 = last.getBoundingClientRect();
  const x1 = r1.left + r1.width / 2 - gr.left,
    y1 = r1.top + r1.height / 2 - gr.top,
    x2 = r2.left + r2.width / 2 - gr.left,
    y2 = r2.top + r2.height / 2 - gr.top;
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.sqrt(dx * dx + dy * dy),
    angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const line = document.createElement("div");
  line.className = "ws-hint-line";
  line.style.width = `${len}px`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.transform = `rotate(${angle}deg)`;
  grid.appendChild(line);
  setTimeout(() => line.remove(), 2500);
}

// ================================================================
// BLOCK PUZZLE with POWER-UPS
// ================================================================
const BP_ROWS = 8,
  BP_COLS = 8,
  BP_TARGET = 440;
let bpBoard = [],
  bpBoardHistory = [],
  bpScore = 0,
  bpSelectedPiece = null,
  bpPieces = [];
let bpPowerups = { rotate: 21, swap: 5, undo: 14 };
let bpLastPlacedSnapshot = null; // for undo
let bpRestarted = false;

const BP_PIECE_DEFS = [
  { shape: [[1, 1, 1]], color: "#ff2d78" },
  { shape: [[1], [1], [1]], color: "#00e5ff" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffe600",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#ff7eb3",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#7ecfff",
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: "#ff2d78",
  },
  { shape: [[1, 1, 1, 1]], color: "#00e5ff" },
  { shape: [[1]], color: "#ffe600" },
  {
    shape: [
      [1, 1],
      [1, 0],
    ],
    color: "#7b0028",
  },
];

function rotatePieceShape(shape) {
  const rows = shape.length,
    cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) rotated[c][rows - 1 - r] = shape[r][c];
  return rotated;
}

function initBP() {
  stopVoice();
  bpBoard = Array(BP_ROWS)
    .fill(null)
    .map(() => Array(BP_COLS).fill(0));
  bpScore = 0;
  bpSelectedPiece = null;
  bpLastPlacedSnapshot = null;
  bpRestarted = false;
  bpPowerups = { rotate: 21, swap: 5, undo: 14 };
  bpPieces = BP_PIECE_DEFS.map((p, i) => ({
    ...p,
    shape: p.shape.map((r) => [...r]),
    id: i,
    used: false,
  }));
  renderBPBoard();
  renderBPPieces();
  updateBPScore();
  updateBPPowerupUI();
  showScreen("bp-screen", true);
  showCompanion("Score 440 to win!");
  // setTimeout(() => playVoice('bp_audio'), 400);
}

function resetBP() {
  bpRestarted = true;
  gameState.challengeRestarted[3] = true;
  initBP();
}

function updateBPPowerupUI() {
  document.getElementById("rotate-badge").textContent = bpPowerups.rotate;
  document.getElementById("swap-badge").textContent = bpPowerups.swap;
  document.getElementById("undo-badge").textContent = bpPowerups.undo;
  document.getElementById("bp-rotate-btn").disabled = bpPowerups.rotate <= 0;
  document.getElementById("bp-swap-btn").disabled = bpPowerups.swap <= 0;
  // undo needs both uses left AND something to undo
  document.getElementById("bp-undo-btn").disabled =
    bpPowerups.undo <= 0 || bpLastPlacedSnapshot === null;
}

function bpRotatePiece() {
  if (bpPowerups.rotate <= 0) {
    showCompanion("No rotates left! 😬");
    return;
  }
  if (bpSelectedPiece === null) {
    showCompanion("Select a piece first! 👈");
    return;
  }
  const piece = bpPieces[bpSelectedPiece];
  if (!piece || piece.used) {
    showCompanion("Select a valid piece! 👈");
    return;
  }
  // Only consume a use when we actually rotate
  bpPowerups.rotate--;
  piece.shape = rotatePieceShape(piece.shape);
  renderBPPieces();
  updateBPPowerupUI();
  showCompanion(`🔄 Rotated! (${bpPowerups.rotate} left)`);
}

function bpSwapPieces() {
  if (bpPowerups.swap <= 0) {
    showCompanion("No swaps left! 😬");
    return;
  }
  bpPowerups.swap--;
  bpSelectedPiece = null;
  bpPieces = [...BP_PIECE_DEFS]
    .sort(() => Math.random() - 0.5)
    .map((p, i) => ({
      ...p,
      shape: p.shape.map((r) => [...r]),
      id: i,
      used: false,
    }));
  renderBPPieces();
  updateBPPowerupUI();
  showCompanion(`🔃 Fresh pieces! (${bpPowerups.swap} swaps left)`);
}

function bpUndo() {
  if (bpPowerups.undo <= 0) {
    showCompanion("No undos left! 😬");
    return;
  }
  if (!bpLastPlacedSnapshot) {
    showCompanion("Nothing to undo! 🤷");
    return;
  }
  bpPowerups.undo--;
  bpBoard = bpLastPlacedSnapshot.board.map((r) => [...r]);
  bpScore = bpLastPlacedSnapshot.score;
  bpPieces = bpLastPlacedSnapshot.pieces.map((p) => ({
    ...p,
    shape: p.shape.map((r) => [...r]),
  }));
  bpLastPlacedSnapshot = null;
  bpSelectedPiece = null;
  renderBPBoard();
  renderBPPieces();
  updateBPScore();
  updateBPPowerupUI();
  showCompanion(`↩ Undo done! (${bpPowerups.undo} left)`);
}

function renderBPBoard() {
  const board = document.getElementById("bp-board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${BP_COLS},1fr)`;
  for (let r = 0; r < BP_ROWS; r++)
    for (let c = 0; c < BP_COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "bp-cell" + (bpBoard[r][c] ? " filled" : "");
      if (bpBoard[r][c]) cell.style.background = bpBoard[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.onclick = () => {
        playClickSound();
        bpPlacePiece(r, c);
      };
      board.appendChild(cell);
    }
}

function renderBPPieces() {
  const container = document.getElementById("bp-pieces");
  container.innerHTML = "";
  bpPieces.forEach((piece, idx) => {
    if (piece.used) return;
    const div = document.createElement("div");
    div.className = "bp-piece" + (bpSelectedPiece === idx ? " selected" : "");
    div.style.gridTemplateColumns = `repeat(${piece.shape[0].length},1fr)`;
    piece.shape.forEach((row) => {
      row.forEach((cell) => {
        const b = document.createElement("div");
        b.className = "bp-block";
        b.style.background = cell ? piece.color : "transparent";
        b.style.border = cell ? "1px solid rgba(0,0,0,.3)" : "none";
        if (cell) b.style.boxShadow = `0 0 4px ${piece.color}`;
        div.appendChild(b);
      });
    });
    div.onclick = () => {
      playClickSound();
      bpSelectedPiece = idx;
      renderBPPieces();
      document.getElementById("bp-target").textContent =
        `Selected Piece ${idx + 1} — Click board to place`;
    };
    container.appendChild(div);
  });
}

function bpPlacePiece(r, c) {
  if (bpSelectedPiece === null) return;
  const piece = bpPieces[bpSelectedPiece];
  if (!piece || piece.used) return;
  const shape = piece.shape;
  for (let dr = 0; dr < shape.length; dr++)
    for (let dc = 0; dc < shape[dr].length; dc++) {
      if (!shape[dr][dc]) continue;
      const nr = r + dr,
        nc = c + dc;
      if (nr >= BP_ROWS || nc >= BP_COLS || bpBoard[nr][nc]) return;
    }
  // Save snapshot for undo
  bpLastPlacedSnapshot = {
    board: bpBoard.map((row) => [...row]),
    score: bpScore,
    pieces: bpPieces.map((p) => ({ ...p, shape: p.shape.map((r) => [...r]) })),
  };
  for (let dr = 0; dr < shape.length; dr++)
    for (let dc = 0; dc < shape[dr].length; dc++) {
      if (shape[dr][dc]) bpBoard[r + dr][c + dc] = piece.color;
    }
  piece.used = true;
  bpScore += 10;
  let linesCleared = 0;
  for (let row = BP_ROWS - 1; row >= 0; row--) {
    if (bpBoard[row].every((v) => v)) {
      bpBoard.splice(row, 1);
      bpBoard.unshift(Array(BP_COLS).fill(0));
      linesCleared++;
      row++;
    }
  }
  for (let col = 0; col < BP_COLS; col++) {
    if (bpBoard.every((row) => row[col])) {
      for (let row = 0; row < BP_ROWS; row++) bpBoard[row][col] = 0;
      linesCleared++;
    }
  }
  bpScore += linesCleared * 20;
  if (linesCleared > 0) {
    const msgs = [
      "BOOM! LINE CLEARED! 💥",
      "NICE! CLEARED IT! 🔥",
      "AWESOME CLEAR! ⚡",
      "SWEEEEP! 🌊",
      "PERFECT LINE! ✨",
    ];
    showCompanion(msgs[Math.floor(Math.random() * msgs.length)]);
    playYey();
    spawnParticles();
  }
  bpSelectedPiece = null;
  renderBPBoard();
  renderBPPieces();
  updateBPScore();
  updateBPPowerupUI();
  if (bpScore >= BP_TARGET) {
    setTimeout(() => completeChallenge(3, 440), 600);
  }
  if (bpPieces.every((p) => p.used)) {
    bpPieces = BP_PIECE_DEFS.map((p, i) => ({
      ...p,
      shape: p.shape.map((r) => [...r]),
      id: i,
      used: false,
    }));
    renderBPPieces();
  }
}

function updateBPScore() {
  document.getElementById("bp-score").textContent =
    `SCORE: ${bpScore} / ${BP_TARGET}`;
}

// ================================================================
// QUIZ — image revealed only on correct answer
// ================================================================
const QUIZ_QS = [
  {
    q: "Which hospital were you born in?",
    img: "quiz/img30.jpg",
    opts: [
      "Velankanni Matha Hospital",
      "Apollo Adlux Hospital",
      "Rajagiri Hospital",
      "Baby Memorial Hospital",
    ],
    ans: 0,
  },
  {
    q: "Where are you from?",
    img: "quiz/img31.jpg",
    opts: ["Muvattupuzha", "Piravom", "Kalloorkad", "Vazhakulam"],
    ans: 1,
  },
  {
    q: "Which college did you graduate from?",
    img: "quiz/img32.jpg",
    opts: ["RSET", "SJCET", "ILAHIA", "VJCET"],
    ans: 3,
  },
  {
    q: "Whom do you love most?",
    img: "quiz/img33.jpg",
    opts: ["Chottu", "Amma", "Appa", "Aniyan"],
    ans: 1,
  },
];
let quizIdx = 0,
  quizWarnings = 0,
  quizRestarted = false;

function initQuiz() {
  stopVoice();
  quizIdx = 0;
  quizWarnings = 0;
  quizRestarted = false;
  showScreen("quiz-screen", true);
  showCompanion("Answer correctly!");
  // setTimeout(() => playVoice('quiz_audio'), 400);
  renderQuiz();
}

function renderQuiz() {
  const q = QUIZ_QS[quizIdx];
  document.getElementById("quiz-info").textContent =
    `QUESTION ${quizIdx + 1}/${QUIZ_QS.length}`;
  document.getElementById("quiz-question").textContent = q.q;
  document.getElementById("quiz-warning").style.display = "none";
  // Hide actual image, show placeholder
  document.getElementById("quiz-img-actual").style.display = "none";
  document.getElementById("quiz-img-placeholder").style.display = "flex";
  document.getElementById("quiz-options").innerHTML = q.opts
    .map(
      (o, i) =>
        `<div class="quiz-opt" onclick="answerQuiz(${i})">${String.fromCharCode(65 + i)}. ${o.toUpperCase()}</div>`,
    )
    .join("");
}

function answerQuiz(i) {
  playClickSound();
  const q = QUIZ_QS[quizIdx],
    opts = document.querySelectorAll(".quiz-opt");
  opts.forEach((o) => (o.onclick = null));
  if (i === q.ans) {
    opts[i].classList.add("correct");
    showCompanion("Correct! 🎉");
    playYey();
    // Reveal image
    if (q.img) {
      document.getElementById("quiz-img-placeholder").style.display = "none";
      document.getElementById("quiz-img-actual").src = q.img;
      document.getElementById("quiz-img-actual").style.display = "block";
    }
    setTimeout(() => {
      quizIdx++;
      if (quizIdx >= QUIZ_QS.length) {
        completeChallenge(4, 440);
      } else renderQuiz();
    }, 1200);
  } else {
    opts[i].classList.add("wrong");
    quizWarnings++;
    if (quizWarnings >= 2) {
      showCompanion("Wrong again! Back to Q1! 😤");
      quizRestarted = true;
      gameState.challengeRestarted[4] = true;
      setTimeout(() => {
        quizIdx = 0;
        quizWarnings = 0;
        renderQuiz();
      }, 1000);
    } else {
      document.getElementById("quiz-warning").style.display = "block";
      showCompanion("One warning! Try again! ⚠️");
      setTimeout(() => renderQuiz(), 1400);
    }
  }
}

// ================================================================
// PHOTO PUZZLE
// ================================================================
const PP_SIZE = 3;
let ppPieces = [],
  ppBoard = Array(PP_SIZE * PP_SIZE).fill(null),
  ppSelectedPiece = null,
  ppRestarted = false;

function initPP() {
  stopVoice();
  ppBoard = Array(PP_SIZE * PP_SIZE).fill(null);
  ppSelectedPiece = null;
  ppRestarted = false;
  ppPieces = Array.from({ length: PP_SIZE * PP_SIZE }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );
  renderPPPreview();
  renderPPMain();
  renderPPPieces();
  showScreen("pp-screen", true);
  showCompanion("Arrange the pieces!");
  // setTimeout(() => playVoice('pp_audio'), 400);
}

function resetPP() {
  ppRestarted = true;
  gameState.challengeRestarted[5] = true;
  initPP();
}

function getPPCellSize() {
  return Math.min(90, Math.floor(window.innerWidth * 0.25));
}
function renderPPPreview() {
  const el = document.getElementById("pp-preview"),
    size = getPPCellSize();
  el.innerHTML = "";
  el.style.gridTemplateColumns = `repeat(${PP_SIZE},${size}px)`;
  for (let i = 0; i < PP_SIZE * PP_SIZE; i++) {
    const row = Math.floor(i / PP_SIZE),
      col = i % PP_SIZE;
    const cell = document.createElement("div");
    cell.className = "pp-cell";
    cell.style.cssText = `width:${size}px;height:${size}px;background:url('main/img2.jpg') ${-col * size}px ${-row * size}px / ${size * PP_SIZE}px ${size * PP_SIZE}px;`;
    el.appendChild(cell);
  }
}
function renderPPMain() {
  const el = document.getElementById("pp-main"),
    size = getPPCellSize();
  el.innerHTML = "";
  el.style.gridTemplateColumns = `repeat(${PP_SIZE},${size}px)`;
  for (let i = 0; i < PP_SIZE * PP_SIZE; i++) {
    const cell = document.createElement("div");
    if (ppBoard[i] !== null) {
      const row = Math.floor(ppBoard[i] / PP_SIZE),
        col = ppBoard[i] % PP_SIZE;
      cell.className = "pp-cell";
      cell.style.cssText = `width:${size}px;height:${size}px;background:url('main/img2.jpg') ${-col * size}px ${-row * size}px / ${size * PP_SIZE}px ${size * PP_SIZE}px;cursor:pointer;`;
    } else {
      cell.className = "pp-cell empty";
      cell.style.cssText = `width:${size}px;height:${size}px;`;
    }
    cell.onclick = () => {
      playClickSound();
      ppClickMain(i);
    };
    el.appendChild(cell);
  }
}
function renderPPPieces() {
  const el = document.getElementById("pp-pieces-board"),
    size = Math.min(70, getPPCellSize() - 10);
  el.innerHTML = "";
  el.style.gridTemplateColumns = `repeat(${PP_SIZE},${size}px)`;
  ppPieces.forEach((pieceIdx, slot) => {
    const placed = ppBoard.includes(pieceIdx),
      item = document.createElement("div");
    item.className =
      "pp-piece-item" +
      (placed ? " placed" : "") +
      (ppSelectedPiece === slot && !placed ? " selected" : "");
    const row = Math.floor(pieceIdx / PP_SIZE),
      col = pieceIdx % PP_SIZE;
    item.style.cssText = `width:${size}px;height:${size}px;background:url('main/img2.jpg') ${-col * size}px ${-row * size}px;background-size:${size * PP_SIZE}px ${size * PP_SIZE}px;`;
    if (!placed) item.onclick = () => ppSelectPiece(slot);
    el.appendChild(item);
  });
}
function ppSelectPiece(slot) {
  ppSelectedPiece = slot;
  renderPPPieces();
  showCompanion("Now click a slot!");
}
function ppClickMain(boardSlot) {
  if (ppSelectedPiece === null) return;
  const pieceIdx = ppPieces[ppSelectedPiece];
  if (ppBoard.includes(pieceIdx)) return;
  if (ppBoard[boardSlot] !== null) {
    showCompanion("Slot taken! Pick another spot. 🙅");
    ppSelectedPiece = null;
    renderPPPieces();
    return;
  }
  ppBoard[boardSlot] = pieceIdx;
  ppSelectedPiece = null;
  renderPPMain();
  renderPPPieces();
  const isCorrect = ppBoard[boardSlot] === boardSlot;
  if (isCorrect) {
    playYey();
    showCompanion("Good placement! ✨");
  } else {
    ppBoard[boardSlot] = null;
    renderPPMain();
    renderPPPieces();
    showCompanion("Wrong spot! Try again. 🔄");
    return;
  }
  if (ppBoard.every((v, i) => v === i)) {
    spawnParticles();
    showCompanion("PERFECT! 🎉");
    setTimeout(() => completeChallenge(5, 440), 800);
  }
}
