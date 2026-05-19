// ================================================================
// REWARDS
// ================================================================
function showRewards() {
  document.getElementById("championMusic").pause();
  if (gameState.musicOn) {
    document
      .getElementById("bgmusic")
      .play()
      .catch(() => {});
  }
  showScreen("rewards-screen");
  showCompanion("Open your gifts! 🎁");
}

function showVideos() {
  document.getElementById("gift-grid").style.display = "none";
  document.getElementById("video-gallery").style.display = "flex";
  document.getElementById("cards-gallery").style.display = "none";
  stopVoice();
  setTimeout(() => playVoice("video_audio"), 300);
}
function hideVideos() {
  stopAllVideos();
  document.getElementById("gift-grid").style.display = "flex";
  document.getElementById("video-gallery").style.display = "none";
  stopVoice();
  // setTimeout(() => playVoice("reward_audio"), 300);
}
function showCards() {
  document.getElementById("gift-grid").style.display = "none";
  document.getElementById("cards-gallery").style.display = "flex";
  document.getElementById("video-gallery").style.display = "none";
  stopVoice();
  setTimeout(() => playVoice("card_audio"), 300);
}
function hideCards() {
  document.getElementById("gift-grid").style.display = "flex";
  document.getElementById("cards-gallery").style.display = "none";
  stopVoice();
  // setTimeout(() => playVoice("reward_audio"), 300);
}

// ================================================================
// CARD SLIDESHOW — images from /pdf/pdf{n}/{i}.jpg
// ================================================================
// How many pages each card has — adjust if cards have different counts
const CARD_PAGE_COUNTS = { 1: 36, 2: 28, 3: 21, 4: 21, 5: 21, 6: 5 };
const CARD_NAMES_MAP = {
  1: "Anson Chekka",
  2: "Chottu",
  3: "Chottu & Chekka",
  4: "Family",
  5: "Chekka & Momu",
  6: "Bike Ride",
};

let ssCurrentCard = 1;
let ssCurrentPage = 1;
let ssTotalPages = 1;

function openCardSlideshow(cardNum) {
  // stop bg music
  document.getElementById("bgmusic").pause();
  // stop champion music
  document.getElementById("championMusic").pause();
  // stop previous card audio
  if (window.currentCardAudio) {
    window.currentCardAudio.pause();
    window.currentCardAudio.currentTime = 0;
  }
  // play card audio
  const cardAudio = new Audio(`audios/card${cardNum}.mp3`);
  cardAudio.loop = true;
  cardAudio.volume = 1;
  cardAudio.play().catch(() => {});
  window.currentCardAudio = cardAudio;
  ssCurrentCard = cardNum;
  ssCurrentPage = 1;
  ssTotalPages = CARD_PAGE_COUNTS[cardNum] || 4;
  startShootingStars();
  document.getElementById("slideshow-title").textContent =
    `💌 ${CARD_NAMES_MAP[cardNum]}`;
  loadSlideshowPage();
  document.getElementById("card-slideshow-overlay").classList.add("active");
  makeDraggable(document.getElementById("card-slideshow-inner"));
}

function loadSlideshowPage() {
  const img = document.getElementById("slideshow-img");
  img.src = `pdf/pdf${ssCurrentCard}/${ssCurrentPage}.jpg`;
  img.onerror = function () {
    // If image not found, we've reached the end — adjust total
    ssTotalPages = ssCurrentPage - 1;
    if (ssTotalPages < 1) ssTotalPages = 1;
    ssCurrentPage = ssTotalPages;
    img.src = `pdf/pdf${ssCurrentCard}/${ssCurrentPage}.jpg`;
    img.onerror = null;
  };
  document.getElementById("slideshow-counter").textContent =
    `${ssCurrentPage} / ${ssTotalPages}`;
  document.getElementById("ss-prev").disabled = ssCurrentPage <= 1;
  document.getElementById("ss-next").disabled = ssCurrentPage >= ssTotalPages;
}

function slideshowPrev() {
  if (ssCurrentPage > 1) {
    ssCurrentPage--;
    loadSlideshowPage();
  }
}
function slideshowNext() {
  if (ssCurrentPage < ssTotalPages) {
    ssCurrentPage++;
    loadSlideshowPage();
  }
}
function slideshowDownload() {
  const a = document.createElement("a");
  a.href = `pdf/pdf${ssCurrentCard}.pdf`;
  a.download = `birthday_card_${CARD_NAMES_MAP[ssCurrentCard].replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
let shootingInterval;

function startShootingStars(){

  stopShootingStars();

  shootingInterval = setInterval(() => {

    const star =
      document.createElement("div");

    star.className =
      "shooting-star";

    star.style.top =
      Math.random() * 30 + "%";

    star.style.left =
      70 + Math.random() * 30 + "%";

    star.style.animationDuration =
      1.2 + Math.random() * 1 + "s";

    document
      .getElementById(
        "card-slideshow-overlay"
      )
      .appendChild(star);

    setTimeout(() => {

      star.remove();

    }, 2200);

  }, 500);

}
function stopShootingStars(){

  clearInterval(shootingInterval);

  document
    .querySelectorAll(".shooting-star")
    .forEach(star => star.remove());

}
function closeCardSlideshow() {
  stopShootingStars();
  document.getElementById("card-slideshow-overlay").classList.remove("active");
  document.getElementById("slideshow-img").src = "";
  // stop card audio
  if (window.currentCardAudio) {
    window.currentCardAudio.pause();
    window.currentCardAudio.currentTime = 0;
  }
  // resume bg music
  const bgm = document.getElementById("bgmusic");
  bgm.volume = 0.2;
  bgm.play().catch(() => {});
}
function downloadCard(n) {
  const a = document.createElement("a");
  a.href = `pdf/pdf${n}.pdf`;
  a.download = `birthday_card_${n}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ================================================================
// VIDEO
// ================================================================
const _playAllIds = ["vid1", "vid2", "vid3"];
let _playAllMode = false;

function setupVideoMutualExclusion() {
  _playAllIds.forEach((id) => {
    const vid = document.getElementById(id);
    if (!vid) return;
    vid.addEventListener("play", () => {
      if (!_playAllMode) {
        _playAllIds.forEach((otherId) => {
          if (otherId !== id) {
            const other = document.getElementById(otherId);
            if (other && !other.paused) other.pause();
          }
        });
      }
    });
  });
}
function playAllVideos() {
  _playAllMode = true;
  _playAllIds.forEach((id) => {
    const v = document.getElementById(id);
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  });
  setTimeout(() => {
    _playAllMode = false;
  }, 500);
}
function stopAllVideos() {
  _playAllMode = false;
  _playAllIds.forEach((id) => {
    const v = document.getElementById(id);
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  });
}
// ================================================================
// FINAL SURPRISE
// ================================================================
let finaleTapped = false,
  finaleBlown = false;

function showFinale() {
  finaleTapped = false;
  finaleBlown = false;
  for (let i = 1; i <= 5; i++) {
    document.getElementById("f" + i).classList.remove("blown");
    document.getElementById("s" + i).classList.remove("show");
  }
  document.getElementById("finale-wish-btn").style.display = "inline-block";
  document.getElementById("finale-blow-btn").style.display = "none";
  document.getElementById("finale-action-msg").style.display = "none";
  document.getElementById("finale-msg").textContent =
    "🎂 MAKE A WISH, ANSON! 🎂";
  document.getElementById("finale-submsg").textContent =
    "Close your eyes and wish for something special...";
  spawnFloatPhotos();
  spawnConfetti();
  stopVoice();
  showScreen("finale-screen", true);
  showCompanion("Time for your wish! 🌟");
  setTimeout(() => playVoice("finale_audio"), 400);
}

function finaleWish() {
  if (finaleTapped) return;
  finaleTapped = true;
  playClickSound();
  document.getElementById("finale-submsg").textContent =
    "Now blow the candles! 💨 Press the button below!";
  document.getElementById("finale-wish-btn").style.display = "none";
  document.getElementById("finale-blow-btn").style.display = "inline-block";
}

function finaleBlowCandles() {
  if (finaleBlown) return;
  finaleBlown = true;
  playClickSound();
  stopVoice();
  document.getElementById("finale-action-msg").style.display = "block";
  document.getElementById("finale-action-msg").textContent = "💨 WHOOOOSH!";
  document.getElementById("finale-submsg").textContent =
    "The candles are out! ✨ Wish granted!";
  for (let i = 1; i <= 5; i++) {
    setTimeout(() => {
      document.getElementById("f" + i).classList.add("blown");
      document.getElementById("s" + i).classList.add("show");
    }, i * 200);
  }
  setTimeout(() => {
    spawnParticles();
    document.getElementById("finale-action-msg").textContent =
      "🎉 WISH GRANTED! ❤️";
    document.getElementById("finale-msg").textContent =
      "❤️ HAPPY BIRTHDAY ANSON ❤️";
    setTimeout(() => {
      showEnding();
    }, 2000);
  }, 1400);
}

// ================================================================
// FLOAT PHOTOS
// ================================================================
function spawnFloatPhotos() {
  document.querySelectorAll(".float-photo").forEach((e) => e.remove());
  const photoFiles = Array.from(
    { length: 22 },
    (_, i) => `finalimg/img${i + 3}.jpg`,
  );
  const total = window.innerWidth <= 600 ? 10 : 22;
  for (let i = 0; i < total; i++) {
    const div = document.createElement("div");
    div.className = "float-photo";
    const mobile = window.innerWidth <= 600;
    const sz = mobile ? 50 + Math.random() * 18 : 120 + Math.random() * 80;
    const left = mobile ? 12 + Math.random() * 60 : 3 + Math.random() * 90;
    const top = mobile ? 15 + Math.random() * 55 : 5 + Math.random() * 85;
    div.style.cssText = `width:${sz}px;height:${sz}px;left:${left}%;top:${top}%;animation-duration:${mobile ? 6 + Math.random() * 3 : 2.5 + Math.random() * 4}s;animation-delay:${Math.random() * 3}s;z-index:4;`;
    const imgSrc = photoFiles[i % photoFiles.length];
    div.onclick = () =>
      showOverlay(
        "❤️ ANSON ❤️",
        `<img src="${imgSrc}" style="width:100%;max-width:400px;border-radius:12px;border:3px solid #ff2d78;box-shadow:0 0 25px #ff2d78;">`,
      );
    const img = document.createElement("img");
    img.src = imgSrc;
    img.style.cssText =
      "width:100%;height:100%;object-fit:cover;border-radius:50%;";
    div.appendChild(img);
    document.body.appendChild(div);
  }
}

// ================================================================
// ENDING
// ================================================================
function showEnding() {
  stopVoice();
  showScreen("ending-screen");
  showCompanion("Happy Birthday! ❤️");
  spawnConfetti();
}

// ================================================================
// PLAY AGAIN
// ================================================================
function playAgain() {
  rewardsVoicePlayed = false;
  gameState.points = 0;
  gameState.completed = [false, false, false, false, false];
  gameState.currentChallenge = 0;
  gameState.challengeRestarted = {};
  document.getElementById("points-display").textContent = "0";
  document.querySelectorAll(".float-photo").forEach((e) => e.remove());
  localStorage.removeItem("anson_birthday_game");
  stopAllVideos();
  stopVoice();
  showHub();
}
