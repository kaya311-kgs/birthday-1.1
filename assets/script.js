const pull = document.getElementById('zip-pull');
const closed = document.getElementById('closed');
const track = document.getElementById('zip-track');

let startY = 0;
let currentY = 0;
let isDragging = false;
let isOpen = false;

function getClientY(e) {
  return e.touches ? e.touches[0].clientY : e.clientY;
}

function onStart(e) {
  if (isOpen || !pull) return;
  isDragging = true;
  startY = getClientY(e) - currentY;
  pull.style.transition = 'none';
}

function onMove(e) {
  if (!isDragging || isOpen || !pull || !track) return;
  
  const maxScroll = track.clientHeight - pull.clientHeight;
  let y = getClientY(e) - startY;
  
  y = Math.max(0, Math.min(y, maxScroll));
  currentY = y;

  pull.style.top = `${y}px`;

  // Trigger when the zipper hits the absolute bottom
  if (y >= maxScroll - 2) {
    completeUnzip(maxScroll);
  }
}

function onEnd() {
  if (isOpen || !pull || !track) return;
  isDragging = false;
  
  const maxScroll = track.clientHeight - pull.clientHeight;
  if (currentY < maxScroll - 2) {
    currentY = 0;
    pull.style.transition = 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    pull.style.top = '0px';
  }
}

function completeUnzip(maxScroll) {
  isOpen = true;
  isDragging = false;

  // Lock zipper at the bottom visually
  pull.style.top = `${maxScroll}px`;

  // Redirect to the card page
  setTimeout(() => {
    window.location.href = 'card.html?celebrate=true';
  }, 250);
}

// Handle audio playback and confetti when card.html loads
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (document.getElementById('hidden') && urlParams.get('celebrate') === 'true') {
    
    // Attempt to play audio and trigger confetti immediately
    setTimeout(() => {
      playFanfare();
      triggerConfetti();
    }, 200);

    // Browser Autoplay Policy Fallback: If browser blocks audio, the first tap/click starts it instantly
    const unlockAudio = () => {
      playFanfare();
      triggerConfetti();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
  }
});

function playFanfare() {
  const audio = document.getElementById('bdayAudio');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log("Audio autoplay restricted by browser, waiting for user tap.");
    });
  }
}

function triggerConfetti() {
  const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fbcfe8', '#e879f9', '#c084fc', '#38bdf8', '#fbbf24'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const size = Math.random() * 8 + 6;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size * (Math.random() > 0.4 ? 1.2 : 2.2)}px`;
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-20px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const duration = 2.5 + Math.random() * 2.5;
    const delay = Math.random() * 0.4;
    confetti.style.animation = `fall ${duration}s linear ${delay}s forwards`;

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), (duration + delay) * 1000);
  }
}

if (pull) {
  pull.addEventListener('touchstart', onStart, { passive: true });
  pull.addEventListener('mousedown', onStart);
}

window.addEventListener('touchmove', onMove, { passive: true });
window.addEventListener('mousemove', onMove);

window.addEventListener('touchend', onEnd);
window.addEventListener('mouseup', onEnd);