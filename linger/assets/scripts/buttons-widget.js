// Load HTML partials and initialize carousel animation
let partialLoaded = false;

async function loadPartial(containerId, partialPath) {
  if (partialLoaded) return;
  
  try {
    const response = await fetch(partialPath);
    if (!response.ok) throw new Error(`Failed to load ${partialPath}`);
    const html = await response.text();
    const container = document.getElementById(containerId);
    if (container && !container.innerHTML) {
      container.insertAdjacentHTML('beforeend', html);
      partialLoaded = true;
      initButtonsCarousel();
    }
  } catch (error) {
    console.error(`Error loading partial ${partialPath}:`, error);
  }
}

function initButtonsCarousel() {
  const track = document.querySelector('.web-revival__track');
  const carousel = document.querySelector('.web-revival__carousel');
  
  if (!track || !carousel) return;
  
  // Esperar a que las imágenes carguen
  setTimeout(() => {
    const buttons = Array.from(track.querySelectorAll('.web-revival__button'));
    const oneSetWidth = buttons.slice(0, 15).reduce((sum, btn, i) => {
      return sum + btn.offsetWidth + (i < 14 ? 6 : 0); // 6px gap entre botones
    }, 0);
    
    let currentPos = 0;
    const speed = 0.5; // píxeles por frame para velocidad
    
    function animate() {
      currentPos += speed;
      
      // Reset para loop infinito cuando se alcanza el fin de una repetición
      if (currentPos >= oneSetWidth) {
        currentPos = 0;
      }
      
      track.style.transform = `translateX(-${currentPos}px)`;
      requestAnimationFrame(animate);
    }
    
    animate();
  }, 500); // Esperar 500ms a que carguen las imágenes
}

document.addEventListener("DOMContentLoaded", () => {
  loadPartial("web-revival-container", "partials/web-revival.html");
});
