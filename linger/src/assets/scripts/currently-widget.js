function initCurrentlyWidget() {
  const data = {
    song: "Hollywood Baby — 100 Gecs",
    watching: "The Boondocks (S2)",
    reading: "1984 — George Orwell",
    playing: "Resident Evil 2 Remake",
  };

  const elSong = document.getElementById("curSong");
  const elWatch = document.getElementById("curWatch");
  const elRead = document.getElementById("curRead");
  const elPlay = document.getElementById("curPlay");

  if (!elSong || !elWatch || !elRead || !elPlay) return;

  elSong.textContent = data.song;
  elWatch.textContent = data.watching;
  elRead.textContent = data.reading;
  elPlay.textContent = data.playing;
}

document.addEventListener("DOMContentLoaded", () => {
  initCurrentlyWidget();
});
