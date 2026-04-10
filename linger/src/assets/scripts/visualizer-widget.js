function initVisualizerWidget() {
  const canvas = document.querySelector("[data-visualizer-canvas]");
  const audio = document.querySelector("[data-mp-audio]");
  const visualizerWidget = document.querySelector("#music-visualizer");

  if (!canvas || !audio || !visualizerWidget) return;

  const ctx = canvas.getContext("2d");
  let audioContext;
  let analyser;
  let animationId;
  let isPlaying = false;
  let sourceConnected = false;
  let noSignalFrames = 0;
  const BAR_COUNT = 20;
  const NOISE_FLOOR = 24; // ignore low noise
  const DECAY = 0.035; // bar fall speed per frame
  const barLevels = Array.from({ length: BAR_COUNT }, () => 0);

  // Get device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    const containerWidth = canvas.offsetWidth || 200;
    const containerHeight = canvas.offsetHeight || 100;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Color palette from theme tokens
  const colors = {
    dark: "#132A13",
    ink2: "#31572C",
    accent: "#4F772D",
    accentLight: "#90A955",
    bg: "#F6FAD0",
  };

  function initAudioContext() {
    if (audioContext) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("AudioContext not supported");
        return false;
      }

      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;

      if (audioContext.createMediaElementSource && !sourceConnected) {
        if (!audio.crossOrigin) audio.crossOrigin = "anonymous";
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceConnected = true;
      }

      return true;
    } catch (e) {
      console.error("Error initializing AudioContext:", e);
      return false;
    }
  }

  function drawVisualizer() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (width === 0 || height === 0) {
      resizeCanvas();
      return;
    }

    // Clear canvas
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, width, height);

    // Draw bars (center-out order)
    const barWidth = width / BAR_COUNT;
    const barSpacing = 2;
    const effectiveBarWidth = barWidth - barSpacing;

    const mid = Math.floor((BAR_COUNT - 1) / 2);
    const barOrder = [mid];
    for (let i = 1; barOrder.length < BAR_COUNT; i++) {
      if (mid - i >= 0) barOrder.push(mid - i);
      if (mid + i < BAR_COUNT) barOrder.push(mid + i);
    }

    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) maxValue = dataArray[i];
    }

    if (maxValue === 0) {
      noSignalFrames += 1;
      if (noSignalFrames === 30) {
        console.warn("Visualizer has no signal. Check CORS on audio files.");
      }
    } else {
      noSignalFrames = 0;
    }

    const binsPerBar = Math.max(1, Math.floor(bufferLength / BAR_COUNT));

    for (let i = 0; i < BAR_COUNT; i++) {
      const start = i * binsPerBar;
      const end = Math.min(bufferLength, start + binsPerBar);
      let sum = 0;
      for (let j = start; j < end; j++) sum += dataArray[j];
      const avg = sum / Math.max(1, end - start);
      const gated = Math.max(0, avg - NOISE_FLOOR);
      const norm = gated / Math.max(1, 255 - NOISE_FLOOR);
      const target = Math.pow(norm, 1.2);
      if (target > barLevels[i]) {
        barLevels[i] = target; // fast attack
      } else {
        barLevels[i] = Math.max(0, barLevels[i] - DECAY);
      }
      const percent = barLevels[i];
      const barHeight = percent * height;

      const xPos = barOrder[i] * barWidth;
      const yPos = height - barHeight;

      // Color gradient based on bar height
      if (percent < 0.33) {
        ctx.fillStyle = colors.accent; // Green
      } else if (percent < 0.66) {
        ctx.fillStyle = colors.accentLight; // Light green
      } else {
        ctx.fillStyle = colors.ink2; // Darker green
      }

      // Draw bar with slight rounded effect
      const radius = 2;
      ctx.fillRect(xPos + radius / 2, yPos, effectiveBarWidth - radius, barHeight);
    }

    if (isPlaying) {
      animationId = requestAnimationFrame(drawVisualizer);
    }
  }

  // Listen to audio play/pause events
  audio.addEventListener("play", () => {
    if (!audioContext) {
      const success = initAudioContext();
      if (!success) {
        console.warn("Failed to init audio context, visualizer disabled");
        return;
      }
    }
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    isPlaying = true;
    visualizerWidget.style.display = "block";
    requestAnimationFrame(() => {
      resizeCanvas();
      drawVisualizer();
    });
  });

  audio.addEventListener("pause", () => {
    const userPaused = audio.dataset.userPaused === "1";
    if (userPaused) {
      isPlaying = false;
      visualizerWidget.style.display = "none";
      if (animationId) cancelAnimationFrame(animationId);
      // Clear canvas
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      ctx.clearRect(0, 0, width, height);
    }
  });

  audio.addEventListener("ended", () => {
    isPlaying = false;
    if (animationId) cancelAnimationFrame(animationId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initVisualizerWidget();
});
