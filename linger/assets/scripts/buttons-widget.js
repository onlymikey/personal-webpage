// Load web revival partial and initialize carousel animation
let webRevivalLoaded = false;

async function loadWebRevivalPartial() {
  if (webRevivalLoaded) return;

  try {
    const response = await fetch('partials/web-revival.html');
    if (!response.ok) throw new Error('Failed to load partials/web-revival.html');

    const html = await response.text();
    const container = document.getElementById('web-revival-container');
    if (container && !container.innerHTML) {
      container.insertAdjacentHTML('beforeend', html);
      webRevivalLoaded = true;
      initButtonsCarousel();
    }
  } catch (error) {
    console.error('Error loading web revival partial:', error);
  }
}

function initSingleCarousel(carousel) {
  const track = carousel.querySelector('.web-revival__track');
  if (!carousel || !track) return;

  const baseButtons = Array.from(track.querySelectorAll('.web-revival__button'));
  if (!baseButtons.length) return;

  const cloneFragment = document.createDocumentFragment();
  baseButtons.forEach((button) => {
    cloneFragment.appendChild(button.cloneNode(true));
  });
  track.appendChild(cloneFragment);

  const parsedSpeed = Number.parseFloat(carousel.dataset.speed || '');
  const speed = Number.isFinite(parsedSpeed) ? parsedSpeed : 0.32;
  const directionStep = carousel.dataset.direction === 'right' ? -1 : 1;

  let oneSetWidth = 0;
  let progress = 0;
  let isPaused = false;
  let rafId = null;
  let resizeTimer = null;

  function measureBaseSetWidth() {
    if (!baseButtons.length) {
      oneSetWidth = 0;
      return;
    }

    const firstBtnRect = baseButtons[0].getBoundingClientRect();
    const lastBtnRect = baseButtons[baseButtons.length - 1].getBoundingClientRect();
    const rightEdge = lastBtnRect.left + lastBtnRect.width;
    oneSetWidth = rightEdge - firstBtnRect.left;
  }

  function render() {
    if (!oneSetWidth) return;

    const offset = ((progress % oneSetWidth) + oneSetWidth) % oneSetWidth;
    track.style.transform = `translateX(-${offset}px)`;
  }

  function step() {
    if (!isPaused && oneSetWidth > 0) {
      progress += speed * directionStep;
      if (progress >= oneSetWidth) {
        progress -= oneSetWidth;
      } else if (progress < 0) {
        progress += oneSetWidth;
      }
      render();
    }

    rafId = requestAnimationFrame(step);
  }

  function recalculateWidthPreservingContinuity() {
    const previousWidth = oneSetWidth;
    const previousProgress = progress;

    measureBaseSetWidth();
    if (!oneSetWidth) return;

    if (previousWidth > 0) {
      const ratio = previousProgress / previousWidth;
      progress = ratio * oneSetWidth;
    } else {
      progress = 0;
    }

    if (progress >= oneSetWidth) {
      progress = progress % oneSetWidth;
    }

    render();
  }

  const onMouseEnter = () => {
    isPaused = true;
  };

  const onMouseLeave = () => {
    isPaused = false;
  };

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      recalculateWidthPreservingContinuity();
    }, 150);
  };

  carousel.addEventListener('mouseenter', onMouseEnter);
  carousel.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', onResize);

  const images = Array.from(track.querySelectorAll('img'));
  const pending = images
    .filter((img) => !img.complete)
    .map((img) => new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }));

  Promise.all(pending).then(() => {
    measureBaseSetWidth();
    if (!oneSetWidth) return;

    render();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(step);
  });
}

function initButtonsCarousel() {
  const carousels = Array.from(document.querySelectorAll('.web-revival__carousel'));
  carousels.forEach((carousel) => {
    initSingleCarousel(carousel);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadWebRevivalPartial();
});
