// wip-widget.js - Random image selector for WIP page

function initWipRandomImage() {
  const wip_images = [
    '/assets/public/wip/cat1.webp',
    '/assets/public/wip/cat2.webp',
    '/assets/public/wip/cat3.webp',
    '/assets/public/wip/cat4.jpg'
  ];

  const wipImage = document.querySelector('.wip-card__image');
  if (!wipImage) return;

  // Select random image
  const randomImage = wip_images[Math.floor(Math.random() * wip_images.length)];
  wipImage.src = randomImage;

  // Hide image if it fails to load (no fallback)
  wipImage.addEventListener('error', () => {
    wipImage.style.display = 'none';
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWipRandomImage);
} else {
  initWipRandomImage();
}
