const PROJECT_LIGHTBOX_ID = "project-lightbox";

function closeProjectLightbox() {
  const lightbox = document.getElementById(PROJECT_LIGHTBOX_ID);
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("project-lightbox-open");
}

function openProjectLightbox(src, altText = "media") {
  const lightbox = ensureProjectLightbox();
  if (!lightbox) return;

  const image = lightbox.querySelector(".project-lightbox__image");
  if (!image) return;

  image.src = src;
  image.alt = altText;

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("project-lightbox-open");
}

function ensureProjectLightbox() {
  const existing = document.getElementById(PROJECT_LIGHTBOX_ID);
  if (existing) return existing;

  const lightbox = document.createElement("div");
  lightbox.id = PROJECT_LIGHTBOX_ID;
  lightbox.className = "project-lightbox";
  lightbox.setAttribute("aria-hidden", "true");

  const dialog = document.createElement("div");
  dialog.className = "project-lightbox__dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", "Expanded media view");
  dialog.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "project-lightbox__close";
  closeButton.setAttribute("aria-label", "Close expanded view");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", closeProjectLightbox);

  const image = document.createElement("img");
  image.className = "project-lightbox__image";
  image.alt = "media";

  dialog.appendChild(closeButton);
  dialog.appendChild(image);
  lightbox.appendChild(dialog);

  lightbox.addEventListener("click", closeProjectLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectLightbox();
    }
  });

  document.body.appendChild(lightbox);
  return lightbox;
}

function initProjectVisuals() {
  // Handle images in visuals
  const images = document.querySelectorAll(".project-visual-item__image");

  images.forEach((img) => {
    const figure = img.closest(".project-visual-item");
    if (!figure) return;

    img.addEventListener("click", () => {
      openProjectLightbox(img.src, img.alt);
    });

    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProjectLightbox(img.src, img.alt);
      }
    });
  });

  // Handle empty visuals grids
  const grids = document.querySelectorAll(".project-visuals-grid");
  grids.forEach((grid) => {
    const items = grid.querySelectorAll(".project-visual-item");
    if (items.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "project-visuals-empty";
      emptyMessage.textContent = "visuals not available";
      grid.appendChild(emptyMessage);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectVisuals);
} else {
  initProjectVisuals();
}
