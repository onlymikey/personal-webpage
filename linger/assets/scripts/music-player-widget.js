function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchTrack(url, opts = {}) {
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

  let seeking = false;

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
    } catch {}
  });

  btnPrev.addEventListener("click", async () => {
    try {
      const track = await fetchTrack("/api/music/prev", { method: "POST" });
      applyTrack(track);
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

  loadNow();
}

document.addEventListener("DOMContentLoaded", () => {
  initMusicPlayerWidget();
});
