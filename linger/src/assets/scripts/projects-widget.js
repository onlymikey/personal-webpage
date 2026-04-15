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

function showCopyNotification() {
  // Remove existing notification if any
  const existing = document.querySelector(".copy-notification");
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement("div");
  notification.className = "copy-notification";
  notification.textContent = "copied!";
  notification.setAttribute("role", "status");
  notification.setAttribute("aria-live", "polite");
  
  document.body.appendChild(notification);
  
  // Remove element after animation completes (2 seconds)
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

function initCodeCopyButtons() {
  // Add copy buttons to all code blocks
  const codeBlocks = document.querySelectorAll(".project-template__code");
  
  codeBlocks.forEach((block) => {
    // Check if button already exists
    if (block.querySelector(".project-template__code__copy-btn")) return;
    
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-template__code__copy-btn";
    btn.setAttribute("aria-label", "Copy code block");
    
    const img = document.createElement("img");
    img.src = "/assets/public/projects/copysvg.svg";
    img.alt = "copy";
    btn.appendChild(img);
    
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get text content from code element
      const codeElement = block.querySelector("code");
      const text = codeElement ? codeElement.textContent : block.textContent;
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(text.trim());
        
        // Visual feedback on button
        btn.classList.add("copied");
        setTimeout(() => {
          btn.classList.remove("copied");
        }, 2000);
        
        // Show notification toast
        showCopyNotification();
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });
    
    block.appendChild(btn);
  });
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
  document.addEventListener("DOMContentLoaded", () => {
    initProjectVisuals();
    initCodeCopyButtons();
  });
} else {
  initProjectVisuals();
  initCodeCopyButtons();
}
