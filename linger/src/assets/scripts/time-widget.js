function initLocalTimeWidget() {
  const clockEl = document.getElementById("localClock");
  const dateEl = document.getElementById("localDate");

  // If the widget isn't on this page, just do nothing.
  if (!clockEl || !dateEl) return;

  const tz = "America/Mexico_City"; 
  const fmtTime = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const fmtDate = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  function tick() {
    const now = new Date();
    clockEl.textContent = fmtTime.format(now);
    dateEl.textContent = fmtDate.format(now);
  }

  tick();
  setInterval(tick, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  initLocalTimeWidget();
});
