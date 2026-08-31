const pull = document.getElementById('zip-pull');
const closed = document.getElementById('closed');
const track = document.getElementById('zip-track');
const zipAudio = document.getElementById('zipAudio'); // Audio element for zipper sound

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

  // Play zipper sound on initial user touch/click
  if (zipAudio) {
    zipAudio.currentTime = 0;
    zipAudio.play().catch(err => console.log("Audio unlock needed on drag", err));
  }
}

function onMove(e) {
  if (!isDragging || isOpen || !pull || !track) return;

  const maxScroll = track.clientHeight - pull.clientHeight;
  let y = getClientY(e) - startY;

  y = Math.max(0, Math.min(y, maxScroll));
  currentY = y;

  pull.style.top = `${y}px`;

  // Resume sound while user actively drags
  if (zipAudio && zipAudio.paused) {
    zipAudio.play().catch(() => {});
  }

  // Trigger when zipper hits the bottom
  if (y >= maxScroll - 2) {
    completeUnzip(maxScroll);
  }
}

function onEnd() {
  if (isOpen || !pull || !track) return;
  isDragging = false;

  // Pause sound when drag pauses or ends
  if (zipAudio) {
    zipAudio.pause();
  }

  const maxScroll = track.clientHeight - pull.clientHeight;
  if (currentY < maxScroll - 2) {
    currentY = 0;
    pull.style.transition = 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    pull.style.top = '0px';

    // Reset audio playback position when zipper resets to top
    if (zipAudio) {
      zipAudio.currentTime = 0;
    }
  }
}

function completeUnzip(maxScroll) {
  isOpen = true;
  isDragging = false;

  // Stop zipper sound
  if (zipAudio) {
    zipAudio.pause();
  }

  // Lock zipper at bottom visually
  pull.style.top = `${maxScroll}px`;

  // Redirect to card page
  setTimeout(() => {
    window.location.href = 'card.html?celebrate=true';
  }, 250);
}

// Handle audio playback and confetti when card.html loads
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (document.getElementById('hidden') && urlParams.get('celebrate') === 'true') {

    // Reveal card animation
    document.getElementById('hidden').classList.add('revealed');

    // Attempt to play celebration audio and trigger confetti
    setTimeout(() => {
      playFanfare();
      triggerConfetti();
    }, 200);

    // Autoplay fallback: start on first tap if blocked by browser policy
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
      console.log("Fanfare autoplay restricted by browser, waiting for user tap.");
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

// Event Listeners for Dragging
if (pull) {
  pull.addEventListener('touchstart', onStart, { passive: true });
  pull.addEventListener('mousedown', onStart);
}

window.addEventListener('touchmove', onMove, { passive: true });
window.addEventListener('mousemove', onMove);

window.addEventListener('touchend', onEnd);
window.addEventListener('mouseup', onEnd);