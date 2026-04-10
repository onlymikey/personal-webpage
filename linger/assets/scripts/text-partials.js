// Load text/content HTML partials (e.g., welcome, about)
const loadedTextPartials = new Set();
const CHANGELOG_MAX_ENTRIES = 8;

function limitChangelogEntries(maxEntries = CHANGELOG_MAX_ENTRIES) {
  const changelogContainer = document.getElementById("changelog-container");
  if (!changelogContainer) return;

  const entries = changelogContainer.querySelectorAll(".widget__body");
  entries.forEach((entry, index) => {
    if (index >= maxEntries) {
      entry.remove();
    }
  });
}

async function loadTextPartial(containerId, partialPath) {
  if (loadedTextPartials.has(containerId)) return;

  const container = document.getElementById(containerId);
  if (!container || container.innerHTML.trim()) return;

  try {
    const response = await fetch(partialPath);
    if (!response.ok) throw new Error(`Failed to load ${partialPath}`);

    const html = await response.text();
    container.insertAdjacentHTML("beforeend", html);
    loadedTextPartials.add(containerId);
  } catch (error) {
    console.error(`Error loading text partial ${partialPath}:`, error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTextPartial("welcome-container", "partials/welcome.html");
  loadTextPartial("about-container", "partials/about.html");
  loadTextPartial("whoami-container", "partials/pages/whoami.html");
  loadTextPartial("guestbook-container", "partials/guestbook.html");
  loadTextPartial("sidebar-menu-container", "partials/sidebar-menu.html");
  loadTextPartial("changelog-container", "partials/changelog.html").then(() => {
    limitChangelogEntries();
  });
  loadTextPartial("ralsei-container", "partials/ralsei.html");
});
