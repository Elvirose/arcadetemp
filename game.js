// ================================================================
// STATE
// ================================================================
let gameState = {
  points: 0,
  completed: [false, false, false, false, false],
  musicOn: false,
  currentChallenge: 0,
  challengeRestarted: {},
};
let rewardsVoicePlayed = false;
// ================================================================
// INIT
// ================================================================
window.addEventListener("DOMContentLoaded", () => {
  initTTS();
  document.addEventListener("click", () => {
    playVoice("pw_audio");
  }, { once: true });
  document.getElementById("pw-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
  });
  setupVideoMutualExclusion();
});

// ================================================================
// PASSWORD
// ================================================================
const CORRECT_PASSWORD = "anson22mathew05";
function checkPassword() {
  playClickSound();
  const val = document.getElementById("pw-input").value.trim().toLowerCase();
  const err = document.getElementById("pw-error");
  if (val === CORRECT_PASSWORD.toLowerCase()) {
    const bgm = document.getElementById("bgmusic");
    bgm.volume = 0.2;
    bgm.play().catch(() => {});
    err.style.display = "none";
    document.getElementById("pw-input").disabled = true;
    document.getElementById("pw-lock-icon").textContent = "🔓";
    setTimeout(() => {
      showScreen("start-screen");
    }, 400);
  } else {
    err.style.display = "block";
    document.getElementById("pw-input").value = "";
    document.getElementById("pw-input").focus();
    setTimeout(() => {
      err.style.display = "none";
    }, 2500);
  }
}

// ================================================================
// SCREEN NAV
// ================================================================
const SCREEN_VOICES = {
  "start-screen": "start_audio",
  "loading-screen": "loading_audio",
  "hub-screen": "hub_audio",
  "rewards-screen": "reward_audio",
  "finale-screen": "finale_audio",
  "ending-screen": "ending_audio",
};

function showScreen(id, skipVoice) {
  stopVoice();
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "rewards-screen") {
    const vg = document.getElementById("video-gallery");
    const cg = document.getElementById("cards-gallery");
    const gg = document.getElementById("gift-grid");
    if (vg) vg.style.display = "none";
    if (cg) cg.style.display = "none";
    if (gg) gg.style.display = "flex";
  }

  if (!skipVoice && SCREEN_VOICES[id]) {
    if (id === "rewards-screen") {
      if (!rewardsVoicePlayed) {
        rewardsVoicePlayed = true;
        setTimeout(() => playVoice(SCREEN_VOICES[id]), 350);
      }
    } else {
      setTimeout(() => playVoice(SCREEN_VOICES[id]), 350);
    }
  }
}

function showHub() {
  updateHub();
  showScreen("hub-screen");
  showCompanion("Pick a challenge!");
  document.getElementById("points-bar").style.display = "block";
  saveProgress();
}

// ================================================================
// START GAME
// ================================================================
function startGame() {
  stopVoice();
  showScreen("loading-screen", true);
  setTimeout(() => playVoice("loading_audio"), 200);
  const texts = [
    "Loading Birthday Adventure...",
    "Preparing Memories...",
    "Generating Love Levels...",
    "Unlocking Birthday Rewards...",
    "Loading Photo Memories...",
    "Spawning Puzzle Challenges...",
    "Almost Ready Anson...",
    "Entering Birthday Arcade...",
  ];
  let prog = 0;
  const bar = document.getElementById("loading-bar"),
    txt = document.getElementById("loading-text");
  const iv = setInterval(() => {
    prog += 7.5;
    if (prog >= 100) {
      prog = 100;
      clearInterval(iv);
      setTimeout(() => showHub(), 800);
    }
    bar.style.width = prog + "%";
    txt.textContent =
      texts[Math.floor((prog / 100) * texts.length)] || texts[texts.length - 1];
  }, 250);
}

// ================================================================
// HUB
// ================================================================
function updateHub() {
  for (let i = 1; i <= 5; i++) {
    const card = document.getElementById("card-" + i);
    card.classList.remove("unlocked", "locked", "completed");
    if (gameState.completed[i - 1]) {
      card.classList.add("completed", "unlocked");
      document.getElementById("lock-" + i).textContent = "";
    } else if (canPlay(i)) {
      card.classList.add("unlocked");
      document.getElementById("lock-" + i).textContent = "";
    } else {
      card.classList.add("locked");
      document.getElementById("lock-" + i).textContent = "🔒";
    }
  }
  document.getElementById("points-display").textContent = gameState.points;
}
function canPlay(n) {
  return n === 1 ? true : gameState.completed[n - 2];
}
function openChallenge(n) {
  if (!canPlay(n)) {
    showOverlay("🔒 LOCKED!", "Complete challenge " + (n - 1) + " first!");
    return;
  }
  gameState.currentChallenge = n;
  showInstruction(n);
}

// ================================================================
// INSTRUCTION
// ================================================================
const INSTRUCTIONS = {
  1: {
    title: "❌ TIC TAC TOE VS BOT",
    body: `<strong>TO WIN THIS LEVEL:</strong><br><br>1. Defeat the bot 3 times<br>2. If you lose, the round resets<br>3. Win all 3 rounds to unlock next level<br><br><strong>Player = X &nbsp;|&nbsp; Bot = O</strong><br><br>Don't worry — the bot is terrible 😄`,
    audio: "ttt_audio",
  },
  2: {
    title: "🔍 WORD SEARCH",
    body: `Find all 14 hidden words to move to the next game.<br><br><strong>Words to find:</strong><br>HAPPY · SMILE · CHEKA · ANSON · BIRTHDAY · CHOTTU · AMMA · APPA · UNNIE · APPU · MWONU · CARLO · VJCET · SPIRTE<br><br><strong>Click &amp; drag</strong> to select words.<br><br><strong>💡 You have 5 hints.</strong> Use them wisely — using all 5 restarts the game!`,
    audio: "ws_audio",
  },
  3: {
    title: "🧩 BLOCK PUZZLE",
    body: `Score <strong>440 points</strong> to move to next game.<br><br><strong>How to play:</strong><br>1. Click a piece to select it<br>2. Click board cells to place it<br>3. Complete lines = bonus points!<br><br><strong>⚡ POWER-UPS:</strong><br>🔄 ROTATE (21 uses) — Rotate selected piece to fit the board<br>🔃 NEW SET (5 uses) — Swap all pieces for a fresh set<br>↩ UNDO (14 uses) — Remove the last placed piece`,
    audio: "bp_audio",
  },
  4: {
    title: "❓ QUIZ ABOUT YOURSELF",
    body: `Answer all questions correctly.<br><br><strong>⚠️ WARNING:</strong><br>1 wrong = 1 warning. 2 wrongs = restart from Q1!`,
    audio: "quiz_audio",
  },
  5: {
    title: "🖼️ PHOTO PUZZLE",
    body: `Arrange all puzzle pieces to complete the final level!<br><br><strong>How to play:</strong><br>1. Click a piece from PIECES board<br>2. Click a slot on YOUR BOARD<br>3. Complete the photo to win!`,
    audio: "pp_audio",
  },
};
function showInstruction(n) {
  const info = INSTRUCTIONS[n];
  document.getElementById("instr-title").textContent = info.title;
  document.getElementById("instr-body").innerHTML = info.body;
  // disable start button first
  document.getElementById("instr-start-btn").disabled = true;
  stopVoice();
  showScreen("instruction-screen", true);
  setTimeout(() => playVoice(info.audio), 300);
  showCompanion("Let's do this! 💪");
}
function startChallenge() {
  stopVoice(); // kill instruction voice immediately
  const n = gameState.currentChallenge;
  if (n === 1) initTTT();
  else if (n === 2) initWS();
  else if (n === 3) initBP();
  else if (n === 4) initQuiz();
  else if (n === 5) initPP();
}
// ================================================================
// COMPLETE CHALLENGE — with stars
// ================================================================
const CHALLENGE_NAMES = [
  "",
  "TIC TAC TOE",
  "WORD SEARCH",
  "BLOCK PUZZLE",
  "QUIZ",
  "PHOTO PUZZLE",
];
const CHALLENGE_DONE_AUDIOS = [
  "",
  "done1_audio",
  "done2_audio",
  "done3_audio",
  "done4_audio",
  "done5_audio",
];

function completeChallenge(n, pts) {
  gameState.completed[n - 1] = true;
  gameState.points += pts;
  document.getElementById("points-display").textContent = gameState.points;
  spawnParticles();
  saveProgress();
  const sfx = document.getElementById("congrats_sfx");
  stopVoice();
  if (sfx) {
    sfx.currentTime = 0;
    sfx.volume = ttsVolume;
    sfx.play().catch(() => {});
    setTimeout(() => {
      playVoice(CHALLENGE_DONE_AUDIOS[n]);
    }, 1200);
  } else {
    playVoice(CHALLENGE_DONE_AUDIOS[n]);
  }
  const starsHTML = buildStarsHTML(n);
  const allDone = gameState.completed.every((v) => v);
  if (allDone) {
    showOverlay(
      "🏆 ALL CHALLENGES COMPLETE!",
      `${starsHTML}<div style="font-size:.7rem;color:#ffe600;margin-bottom:12px;">+${pts} PTS &nbsp;|&nbsp; Total: ${gameState.points} pts</div><div style="font-size:.45rem;color:#ddd;line-height:2;margin-bottom:16px;">🎉 Amazing Anson! You've beaten every<br>challenge! Download your certificate!</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;"><button class="cert-btn cert-view" onclick="viewCertificate()">🏆 CERTIFICATE</button></div><button class="btn-pixel green" style="font-size:.5rem;padding:12px 20px;" onclick="closeOverlay();showCelebration();">🎁 CLAIM REWARD</button>`,
    );
  } else {
    const nextName = CHALLENGE_NAMES[n + 1] || "";
    showOverlay(
      `🎉 CHALLENGE ${n} COMPLETE!`,
      `${starsHTML}<div style="font-size:.7rem;color:#ffe600;margin-bottom:12px;">+${pts} PTS &nbsp;|&nbsp; Total: ${gameState.points} pts</div><div style="font-size:.45rem;color:#ddd;line-height:2;margin-bottom:18px;">✅ ${CHALLENGE_NAMES[n]} cleared!<br>Ready for Challenge ${n + 1}?<br><span style="color:#00e5ff;">${nextName}</span></div><button class="btn-pixel green" style="font-size:.5rem;padding:12px 20px;" onclick="closeOverlay();openChallenge(${n + 1});">🚀 NEXT CHALLENGE →</button><button class="btn-pixel" style="font-size:.45rem;padding:8px 16px;margin-top:10px;background:rgba(100,100,100,.3);box-shadow:none;border:1.5px solid #555;" onclick="closeOverlay();showHub();">🕹️ BACK TO HUB</button>`,
    );
  }
}

// ================================================================
// CELEBRATION
// ================================================================
function showCelebration() {
  document.getElementById("bgmusic").pause();
  const ch = document.getElementById("championMusic");
  ch.currentTime = 0;
  ch.play().catch(() => {});
  document.getElementById("celeb-pts").textContent =
    `YOU HAVE EARNED ${gameState.points} POINTS!`;
  stopVoice();
  showScreen("celebration-screen", true);
  spawnConfetti();
  showCompanion("🎉 YOU DID IT ALL!");
}

// ================================================================
// CERTIFICATE
// ================================================================
function viewCertificate() {
  document.getElementById("cert-overlay-img").src = "certify/certify.jpg";
  document.getElementById("cert-overlay").classList.add("active");
}
function closeCertOverlay() {
  document.getElementById("cert-overlay").classList.remove("active");
}
async function downloadCertificate() {
  const { jsPDF } = window.jspdf;
  const img = document.getElementById("cert-overlay-img");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1000, 700],
  });
  pdf.addImage(img.src, "JPEG", 0, 0, 1000, 700);
  pdf.save("Birthday_Certificate.pdf");
}
// ================================================================
// SAVE / LOAD
// ================================================================
function saveProgress() {
  localStorage.setItem(
    "anson_birthday_game",
    JSON.stringify({
      points: gameState.points,
      completed: gameState.completed,
      challengeRestarted: gameState.challengeRestarted,
    }),
  );
}
function loadProgress() {
  const d = localStorage.getItem("anson_birthday_game");
  if (d) {
    const p = JSON.parse(d);
    gameState.points = p.points || 0;
    gameState.completed = p.completed || [false, false, false, false, false];
    gameState.challengeRestarted = p.challengeRestarted || {};
  }
}
loadProgress();

document
  .querySelectorAll("button")
  .forEach((btn) => btn.addEventListener("click", () => playClickSound()));
