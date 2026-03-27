// Load text/content HTML partials (e.g., welcome, about)
const loadedTextPartials = new Set();

async function loadTextPartial(containerId, partialPath) {
  if (loadedTextPartials.has(containerId)) return;

  try {
    const response = await fetch(partialPath);
    if (!response.ok) throw new Error(`Failed to load ${partialPath}`);

    const html = await response.text();
    const container = document.getElementById(containerId);
    if (container && !container.innerHTML) {
      container.insertAdjacentHTML("beforeend", html);
      loadedTextPartials.add(containerId);
    }
  } catch (error) {
    console.error(`Error loading text partial ${partialPath}:`, error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTextPartial("welcome-container", "partials/welcome.html");
  loadTextPartial("about-container", "partials/about.html");
  loadTextPartial("sidebar-menu-container", "partials/sidebar-menu.html");
  loadTextPartial("changelog-container", "partials/changelog.html");
  loadTextPartial("ralsei-container", "partials/ralsei.html");
});
