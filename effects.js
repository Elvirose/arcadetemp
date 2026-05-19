// ================================================================
// AMBIENT
// ================================================================
function createShootingStars() {
  const emojiFloaters = [
    "💖",
    "🐥",
    "🧸",
    "🎂",
    "🎩",
    "💕",
    "🎈",
    "🌟",
    "✨",
    "💫",
    "🎁",
    "🎀",
  ];
  const starColors = [
    "white",
    "white",
    "white",
    "#ff9fff",
    "#ffe600",
    "#00e5ff",
    "#ff2d78",
    "#fff8f0",
  ];
  for (let i = 0; i < 35; i++) {
    const s = document.createElement("div");
    s.className = "shooting-star";
    const sz = 1 + Math.random() * 3,
      color = starColors[Math.floor(Math.random() * starColors.length)];
    const dur = 1.2 + Math.random() * 4,
      tail = 30 + Math.random() * 60;
    s.style.cssText = `top:${Math.random() * 80}%;left:${Math.random() * 100}%;width:${tail}px;height:${sz}px;background:linear-gradient(90deg,${color},transparent);animation-duration:${dur}s;animation-delay:${Math.random() * 8}s;`;
    document.body.appendChild(s);
  }
  for (let i = 0; i < 28; i++) {
    const f = document.createElement("div");
    f.className = "floater";
    f.textContent =
      emojiFloaters[Math.floor(Math.random() * emojiFloaters.length)];
    f.style.cssText = `left:${Math.random() * 100}%;animation-duration:${5 + Math.random() * 12}s;animation-delay:${Math.random() * 10}s;font-size:${1.2 + Math.random() * 1.4}rem;opacity:.85;`;
    document.body.appendChild(f);
  }
}
createShootingStars();
// ================================================================
// COMPANION
// ================================================================
function showCompanion(msg = "", show = true) {
  const comp = document.getElementById("pixel-companion"),
    bub = document.getElementById("companion-bubble");
  comp.style.display = show ? "block" : "none";
  if (msg) {
    bub.textContent = msg;
    bub.style.display = "block";
  } else {
    bub.style.display = "none";
  }
}

// ================================================================
// STARS HELPER — 3 stars for clean win, 2 for restarted
// ================================================================
function buildStarsHTML(challengeNum) {
  const restarted = gameState.challengeRestarted[challengeNum] || false;
  const count = restarted ? 2 : 3;
  const stars = [];
  for (let i = 0; i < count; i++)
    stars.push(`<span class="overlay-star">⭐</span>`);
  // dim stars (empty)
  for (let i = count; i < 3; i++)
    stars.push(
      `<span class="overlay-star" style="opacity:.2;animation:none;">⭐</span>`,
    );
  return `<div class="overlay-stars">${stars.join("")}</div>`;
}
function spawnConfetti() {
  const colors = [
    "#ff2d78",
    "#ffe600",
    "#00e5ff",
    "#7b0028",
    "#ff7eb3",
    "#7ecfff",
  ];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.cssText = `left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};animation-duration:${2 + Math.random() * 3}s;animation-delay:${Math.random() * 2}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}
// ================================================================
// OVERLAY
// ================================================================
function showOverlay(title, msg) {
  document.getElementById("overlay-body").innerHTML =
    `<div style="font-size:.8rem;color:var(--neon-pink);margin-bottom:16px;">${title}</div><div style="font-size:.5rem;color:#ddd;line-height:2;">${msg}</div>`;
  document.getElementById("overlay").classList.add("active");
}
function closeOverlay() {
  document.getElementById("overlay").classList.remove("active");
}

// ================================================================
// PARTICLES
// ================================================================
function spawnParticles() {
  const emojis = ["✨", "💖", "🎉", "⭐", "💫"];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "win-particle";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = `position:fixed;left:50%;top:50%;font-size:1.5rem;z-index:1000;pointer-events:none;--tx:${(Math.random() - 0.5) * 300}px;--ty:${(Math.random() - 0.5) * 300}px;animation:particleBurst .8s ease-out forwards;animation-delay:${Math.random() * 0.3}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}
