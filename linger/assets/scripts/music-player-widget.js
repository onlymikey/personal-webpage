// ===== MOCK PLAYER (TODO: remove after testing) =====
const MOCK_PLAYER = true;
let mockCurrentIndex = 0;

const MOCK_QUEUE = [
  {
    title: "Hollywood Baby",
    artist: "100 gecs",
    cover: "assets/mock/covers/hollywood-baby.png",
    audio: "assets/mock/audio/hollywood-baby.mp3",
    duration: 45,
  },
  {
    title: "Safe and Sound",
    artist: "Capital Cities",
    cover: "assets/mock/covers/safe-and-sound.png",
    audio: "assets/mock/audio/safe-and-sound.mp3",
    duration: 52,
  },
];

// ===== END MOCK PLAYER =====

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchTrack(url, opts = {}) {
  if (MOCK_PLAYER) {
    // Mock implementation
    await new Promise(r => setTimeout(r, 100)); // simulate network delay
    
    if (url.includes("/now")) {
      const track = MOCK_QUEUE[mockCurrentIndex];
      return {
        ...track,
        canPrev: mockCurrentIndex > 0,
        canNext: mockCurrentIndex < MOCK_QUEUE.length - 1,
      };
    }
    
    if (url.includes("/next")) {
      if (mockCurrentIndex < MOCK_QUEUE.length - 1) mockCurrentIndex++;
      const track = MOCK_QUEUE[mockCurrentIndex];
      return {
        ...track,
        canPrev: mockCurrentIndex > 0,
        canNext: mockCurrentIndex < MOCK_QUEUE.length - 1,
      };
    }
    
    if (url.includes("/prev")) {
      if (mockCurrentIndex > 0) mockCurrentIndex--;
      const track = MOCK_QUEUE[mockCurrentIndex];
      return {
        ...track,
        canPrev: mockCurrentIndex > 0,
        canNext: mockCurrentIndex < MOCK_QUEUE.length - 1,
      };
    }
  }
  
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) throw new Error(`music fetch failed: ${res.status}`);
  return await res.json();
}

function initMusicPlayerWidget() {
  const root = document.querySelector("#music-player");
  if (!root) return;

  const elTitle = root.querySelector("[data-mp-title]");
  const elArtist = root.querySelector("[data-mp-artist]");
  const elCover = root.querySelector(".music-player__cover");
  const btnPlay = root.querySelector("[data-mp-play]");
  const btnPrev = root.querySelector("[data-mp-prev]");
  const btnNext = root.querySelector("[data-mp-next]");
  const range = root.querySelector("[data-mp-seek]");
  const tCur = root.querySelector("[data-mp-cur]");
  const tDur = root.querySelector("[data-mp-dur]");
  const audio = root.querySelector("[data-mp-audio]");
  const volumeRange = root.querySelector("[data-mp-volume]");
  const volumeBtn = root.querySelector("[data-mp-mute-btn]");
  const volumeIcon = root.querySelector("[data-mp-volume-icon]");

  let seeking = false;
  let previousVolume = 0.6;

  function applyTrack(track) {
    elTitle.textContent = track?.title ?? "—";
    elArtist.textContent = track?.artist ?? "—";
    if (track?.cover) elCover.src = track.cover;

    // IMPORTANT: set src but do NOT autoplay.
    if (track?.audio) {
      audio.src = track.audio;
      audio.load();
    }

    btnPrev.disabled = track?.canPrev === false;
    btnNext.disabled = track?.canNext === false;

    // reset UI
    btnPlay.textContent = "▶";
    range.value = "0";
    tCur.textContent = "0:00";
    tDur.textContent = track?.duration ? formatTime(track.duration) : "0:00";
  }

  async function loadNow() {
    try {
      const track = await fetchTrack("/api/music/now");
      applyTrack(track);
    } catch (e) {
      // leave widget usable even if backend down
      elTitle.textContent = "offline";
      elArtist.textContent = "music backend not reachable";
    }
  }

  btnPlay.addEventListener("click", async () => {
    if (!audio.src) return;

    try {
      if (audio.paused) {
        await audio.play(); // user gesture -> ok
        btnPlay.textContent = "⏸";
      } else {
        audio.pause();
        btnPlay.textContent = "▶";
      }
    } catch {
      // autoplay policy / decode issues
      btnPlay.textContent = "▶";
    }
  });

  btnNext.addEventListener("click", async () => {
    try {
      const track = await fetchTrack("/api/music/next", { method: "POST" });
      applyTrack(track);
      await audio.play();
      btnPlay.textContent = "⏸";
    } catch {}
  });

  btnPrev.addEventListener("click", async () => {
    try {
      const track = await fetchTrack("/api/music/prev", { method: "POST" });
      applyTrack(track);
      await audio.play();
      btnPlay.textContent = "⏸";
    } catch {}
  });

  audio.addEventListener("loadedmetadata", () => {
    tDur.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (seeking) return;
    tCur.textContent = formatTime(audio.currentTime);
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    range.value = String(pct);
  });

  audio.addEventListener("ended", () => {
    btnPlay.textContent = "▶";
  });

  range.addEventListener("input", () => {
    seeking = true;
  });

  range.addEventListener("change", () => {
    const pct = Number(range.value) / 100;
    if (audio.duration && Number.isFinite(pct)) audio.currentTime = pct * audio.duration;
    seeking = false;
  });

  volumeRange.addEventListener("input", () => {
    const newVolume = Number(volumeRange.value) / 100;
    audio.volume = newVolume;
    if (newVolume > 0) previousVolume = newVolume;
    updateVolumeIcon();
  });

  volumeBtn.addEventListener("click", () => {
    if (audio.volume > 0) {
      previousVolume = audio.volume;
      audio.volume = 0;
      volumeRange.value = "0";
    } else {
      audio.volume = previousVolume;
      volumeRange.value = String(previousVolume * 100);
    }
    updateVolumeIcon();
  });

  function updateVolumeIcon() {
    if (audio.volume === 0) {
      volumeIcon.src = "assets/icons/mute.png";
    } else {
      volumeIcon.src = "assets/icons/volume.png";
    }
  }

  // Initialize volume to 20%
  audio.volume = 0.2;
  previousVolume = 0.2;
  updateVolumeIcon();

  loadNow();
}

document.addEventListener("DOMContentLoaded", () => {
  initMusicPlayerWidget();
});
