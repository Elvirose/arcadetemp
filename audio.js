// ================================================================
// TTS
// ================================================================
let ttsVoice = null,
  ttsVolume = 1,
  ttsEnabled = true;

const VOICE_SCRIPTS = {
  pw_audio:
    "Please enter your secret password to unlock the birthday surprise!",
  start_audio:
    "You're in! Happy Birthday Anson! Tap Start Game to begin your birthday adventure!",
  loading_audio: "Loading your birthday adventure. Get ready for some fun!",
  hub_audio:
    "Welcome to the Birthday Arcade Hub! Pick your first challenge and let's go!",
  ttt_audio:
    "Tic Tac Toe versus the bot! Win three rounds to unlock the next challenge. You are X, the bot is O. Good luck!",
  ws_audio:
    "Word Search time! Find all fourteen hidden words to move to the next game. Click and drag to select words! You have five hints available. Once all five hints are used, the game will restart without hints, so use them carefully!",
  bp_audio:
    "Block Puzzle! Score four hundred and forty points to move on. Click a piece to select it, then click the board to place it. Rotate has twenty one chances available, Swap has five chances available, and Undo has fourteen chances available. Use your power ups wisely!",
  quiz_audio:
    "Quiz time! Answer all questions correctly. Two wrong answers means you restart from question one. Think carefully!",
  pp_audio:
    "Photo Puzzle! Arrange all the pieces to complete the final level. Click a piece, then click a slot to place it!",
  done1_audio:
    "Amazing! Challenge one complete! Press Next to go to Challenge two — Word Search!",
  done2_audio:
    "Incredible! Challenge two complete! Press Next to go to Challenge three — Block Puzzle!",
  done3_audio:
    "Fantastic! Challenge three complete! Press Next to go to Challenge four — the Quiz!",
  done4_audio:
    "Outstanding! Challenge four complete! Press Next to go to the final Challenge — Photo Puzzle!",
  done5_audio:
    "You've completed all five challenges! Incredible work! Claim your reward now!",
  reward_audio:
    "Here are your birthday rewards! Watch the edit videos, open your cards — you've earned them!",
  video_audio:
    "Here are your birthday edit videos! Hit Play All to watch them all at once, or control them individually.",
  card_audio:
    "Here are your birthday cards! Click View to open, or Save to download each one.",
  finale_audio:
    "And now for the final surprise! Close your eyes Anson, make a secret wish, then blow out the candles!",
  ending_audio:
    "Happy Birthday Anson! No matter how many games we play, you'll always be my favourite player. We love you so much!",
  congrats: "Congratulations! Well done!",
};

let _voiceCancelToken = 0;
let currentVoiceKey = null;
function initTTS() {
  if (!window.speechSynthesis) return;
  function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    const preferred = [
      "Google UK English Male",
      "Microsoft David",
      "Alex",
      "Daniel",
      "Fred",
      "Ralph",
    ];
    for (const name of preferred) {
      const v = voices.find((v) => v.name === name);
      if (v) {
        ttsVoice = v;
        break;
      }
    }
    if (!ttsVoice) {
      ttsVoice =
        voices.find((v) => v.lang.startsWith("en") && /male/i.test(v.name)) ||
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            !/(female|zira|hazel|susan|kate|victoria|samantha|karen|moira|fiona)/i.test(
              v.name,
            ),
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
    }
  }
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text) {
  if (!ttsEnabled || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const myToken = ++_voiceCancelToken;

  const utter = new SpeechSynthesisUtterance(text);

  if (ttsVoice) utter.voice = ttsVoice;

  utter.pitch = 0.85;
  utter.rate = 0.97;
  utter.volume = ttsVolume;
  utter.lang = "en-US";
  utter.onend = () => {
    const startBtn = document.getElementById("instr-start-btn");

    if (startBtn) {
      startBtn.disabled = false;
    }
  };

  if (!ttsEnabled || myToken !== _voiceCancelToken) return;

  try {
    window.speechSynthesis.speak(utter);
  } catch (e) {}
}

function stopVoice() {
  ++_voiceCancelToken;
  currentVoiceKey = null;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function playVoice(scriptKey) {
  // prevent replaying same voice again
  if (currentVoiceKey === scriptKey && window.speechSynthesis.speaking) {
    return;
  }
  stopVoice();
  currentVoiceKey = scriptKey;
  const text = VOICE_SCRIPTS[scriptKey];
  if (text) speak(text);
}

function setVoiceVol(v) {
  ttsVolume = parseFloat(v);
}

function toggleVoice() {
  stopVoice();
  ttsEnabled = !ttsEnabled;
  const btn = document.getElementById("voice-btn");
  if (ttsEnabled) {
    btn.innerHTML = "🔊 VOICE";
    btn.classList.remove("off");
    setTimeout(() => {
      if (ttsEnabled) speak("Voice enabled");
    }, 150);
  } else {
    btn.innerHTML = "🔇 VOICE";
    btn.classList.add("off");
  }
}

// ================================================================
// MUSIC
// ================================================================
function toggleMusic() {
  gameState.musicOn = !gameState.musicOn;
  const btn = document.getElementById("music-btn"),
    mus = document.getElementById("bgmusic");
  if (gameState.musicOn) {
    mus.play().catch(() => {});
    btn.classList.remove("off");
  } else {
    mus.pause();
    btn.classList.add("off");
  }
}
function setMusicVol(v) {
  const mus = document.getElementById("bgmusic");
  if (mus) mus.volume = parseFloat(v);
  const ch = document.getElementById("championMusic");
  if (ch) ch.volume = parseFloat(v);
}

const clickSoundPool = [];
for (let i = 0; i < 10; i++) {
  const a = new Audio("audios/click.mp3");
  a.preload = "auto";
  clickSoundPool.push(a);
}
let clickIndex = 0;
function playClickSound() {
  const s = clickSoundPool[clickIndex];
  if (s) {
    s.currentTime = 0;
    s.play().catch(() => {});
  }
  clickIndex = (clickIndex + 1) % clickSoundPool.length;
}
function playYey() {
  const a = document.getElementById("yey_sfx");
  if (a) {
    a.pause();
    a.currentTime = 0;
    a.volume = ttsVolume;
    a.play().catch(() => {});
  }
}
