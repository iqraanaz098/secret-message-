/* =========================================================
   Secret Message 💌 — script.js

   1. Grab elements + small helpers
   2. Particle factory (hearts, sparkles, dots)
   3. Burst effect (used when opening + sending love)
   4. Background floaters + twinkles
   5. Open / reveal / replay sequence
   6. "Send a Little Love" feature
   7. Button cursor glow
   8. Start everything
   ========================================================= */

'use strict';


/* ---------- 1. ELEMENTS + HELPERS ---------- */
const welcome   = document.querySelector('#welcome');
const scene     = document.querySelector('#scene');
const envelope  = document.querySelector('#envelope');
const openBtn   = document.querySelector('#openBtn');
const message   = document.querySelector('#message');
const loveBtn   = document.querySelector('#loveBtn');
const againBtn  = document.querySelector('#againBtn');
const loveNote  = document.querySelector('#loveNote');
const veil      = document.querySelector('#veil');
const fxLayer   = document.querySelector('#fxLayer');
const bgLayer   = document.querySelector('#bgParticles');

// Respect people who ask their device for less motion
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Soft palette used for every particle
const COLORS = ['#f4a9c0', '#e5769b', '#f9c6d5', '#cdbff3', '#b7a6ea', '#ffd8b0'];

// The same heart shape as in the HTML, reused for particles
const HEART_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

// The little messages shown by "Send a Little Love" (first one is the main one)
const LOVE_NOTES = [
  'A little happiness sent your way ✨',
  'Sending you a warm little hug 🤍',
  'Hope this made your day a bit softer 🌷',
];
let loveCount = 0;
let noteTimer = null;

// Random number between min and max
const rand = (min, max) => Math.random() * (max - min) + min;
// Random item from an array
const pick = (list) => list[Math.floor(Math.random() * list.length)];
// Pause inside async functions: await wait(500)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 60 : ms));


/* ---------- 2. PARTICLE FACTORY ---------- */
// kind = 'heart' | 'sparkle' | 'dot'
function createParticle(kind, size) {
  const el = document.createElement('span');
  el.className = `particle particle--${kind}`;
  el.style.setProperty('--size', `${size}px`);
  el.style.setProperty('--color', pick(COLORS));
  if (kind === 'heart') el.innerHTML = HEART_SVG;
  return el;
}


/* ---------- 3. BURST EFFECT ---------- */
// Sends particles flying outward from a point (x, y) on the screen
function burst(x, y, options = {}) {
  if (reducedMotion) return;

  const {
    count = 18,
    kinds = ['heart', 'heart', 'sparkle', 'dot'],
    minDist = 70,
    maxDist = 170,
  } = options;

  for (let i = 0; i < count; i++) {
    const kind = pick(kinds);
    const size = kind === 'heart' ? rand(14, 26) : kind === 'sparkle' ? rand(10, 18) : rand(4, 8);
    const p = createParticle(kind, size);

    // Spread particles evenly around a circle, with a little randomness
    const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
    const distance = rand(minDist, maxDist);

    p.classList.add('particle--burst');
    p.style.setProperty('--ox', `${x}px`);
    p.style.setProperty('--oy', `${y}px`);
    p.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    p.style.setProperty('--rot', `${rand(-90, 90)}deg`);
    p.style.setProperty('--dur', `${rand(1.1, 1.8)}s`);

    // Clean up when the animation is done
    p.addEventListener('animationend', () => p.remove());
    fxLayer.appendChild(p);
  }
}

// Center point of any element (handy for bursts)
function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}


/* ---------- 4. BACKGROUND FLOATERS + TWINKLES ---------- */
const MAX_FLOATERS = 16;
let floaterCount = 0;

// One heart / sparkle / dot that slowly rises and fades
function spawnFloater(startMidway = false) {
  if (floaterCount >= MAX_FLOATERS) return;

  const roll = Math.random();
  const kind = roll < 0.6 ? 'heart' : roll < 0.85 ? 'sparkle' : 'dot';
  const size = kind === 'heart' ? rand(10, 24) : kind === 'sparkle' ? rand(8, 16) : rand(4, 8);
  const duration = rand(13, 22);

  const p = createParticle(kind, size);
  p.classList.add('particle--float');
  p.style.setProperty('--x', `${rand(2, 96)}%`);
  p.style.setProperty('--sway', `${rand(-45, 45)}px`);
  p.style.setProperty('--rot', `${rand(-40, 40)}deg`);
  p.style.setProperty('--dur', `${duration}s`);
  p.style.setProperty('--max-opacity', rand(0.35, 0.7).toFixed(2));
  // A negative delay starts the animation "already in progress"
  p.style.setProperty('--delay', startMidway ? `${-rand(0, duration)}s` : '0s');

  floaterCount++;
  p.addEventListener('animationend', () => {
    p.remove();
    floaterCount--;
  });
  bgLayer.appendChild(p);
}

// Small sparkles that twinkle in place
function spawnTwinkles(total = 12) {
  for (let i = 0; i < total; i++) {
    const p = createParticle('sparkle', rand(8, 14));
    p.classList.add('particle--twinkle');
    p.style.setProperty('--x', `${rand(3, 96)}%`);
    p.style.setProperty('--y', `${rand(4, 94)}%`);
    p.style.setProperty('--dur', `${rand(3, 6)}s`);
    p.style.setProperty('--delay', `${rand(0, 4)}s`);
    bgLayer.appendChild(p);
  }
}

function startBackground() {
  if (reducedMotion) return;

  spawnTwinkles();
  for (let i = 0; i < 9; i++) spawnFloater(true);   // fill the screen at the start

  // Add a new floater every ~1.6 seconds (skip while the tab is hidden)
  setInterval(() => {
    if (!document.hidden) spawnFloater();
  }, 1600);
}


/* ---------- 5. OPEN / REVEAL / REPLAY ---------- */
// state: 'closed' -> 'opening' -> 'revealed' -> 'resetting' -> 'closed'
let state = 'closed';

async function openMessage() {
  if (state !== 'closed') return;
  state = 'opening';
  openBtn.disabled = true;

  // 1) Flap opens, then the letter slides up (all done by CSS)
  envelope.classList.add('is-open');
  await wait(700);

  // 2) Magic burst from the envelope
  const c = centerOf(envelope);
  burst(c.x, c.y - 30, { count: 28, minDist: 90, maxDist: 230 });
  await wait(700);

  // 3) Soft white flash covers the screen
  veil.classList.add('is-flashing');
  await wait(100);

  // 4) Welcome card fades away while the flash is at its brightest
  welcome.classList.add('is-leaving');
  await wait(750);
  welcome.hidden = true;

  // 5) Reveal the message card
  showMessage();
}

function showMessage() {
  message.hidden = false;
  message.classList.add('is-visible');   // starts the card + line-by-line animations
  message.focus({ preventScroll: true }); // helps keyboard / screen reader users
  state = 'revealed';

  // A gentle burst of hearts around the card
  const c = centerOf(message);
  burst(c.x, c.y - 40, { count: 14, kinds: ['heart', 'sparkle'], minDist: 120, maxDist: 240 });
}

async function replay() {
  if (state !== 'revealed') return;
  state = 'resetting';

  // Fade the message card out
  message.classList.add('is-leaving');
  await wait(700);
  message.hidden = true;
  message.classList.remove('is-visible', 'is-leaving');
  hideNote();

  // Put the envelope back to its closed state (welcome card is still hidden here)
  envelope.classList.remove('is-open');
  welcome.classList.remove('is-leaving');
  welcome.hidden = false;                // CSS "is-entering" animation plays again
  openBtn.disabled = false;
  openBtn.focus({ preventScroll: true });
  state = 'closed';
}


/* ---------- 6. SEND A LITTLE LOVE ---------- */
function sendLove() {
  // Burst of hearts around the button
  const c = centerOf(loveBtn);
  burst(c.x, c.y, {
    count: 16,
    kinds: ['heart', 'heart', 'heart', 'sparkle'],
    minDist: 60,
    maxDist: 140,
  });

  // Tiny "squish" on the button (remove + re-add the class to restart it)
  loveBtn.classList.remove('is-pop');
  void loveBtn.offsetWidth;
  loveBtn.classList.add('is-pop');

  // Show the next little message, then fade it after a few seconds
  showNote(LOVE_NOTES[loveCount % LOVE_NOTES.length]);
  loveCount++;
}

function showNote(text) {
  clearTimeout(noteTimer);
  loveNote.textContent = text;
  loveNote.classList.add('is-shown');
  noteTimer = setTimeout(hideNote, 3800);
}

function hideNote() {
  clearTimeout(noteTimer);
  loveNote.classList.remove('is-shown');
}


/* ---------- 7. BUTTON CURSOR GLOW ---------- */
// Tell the CSS where the cursor is inside each button (--x / --y)
function enableButtonGlow() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointermove', (event) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${event.clientX - r.left}px`);
      btn.style.setProperty('--y', `${event.clientY - r.top}px`);
    });
  });
}


/* ---------- 8. START ---------- */
openBtn.addEventListener('click', openMessage);
scene.addEventListener('click', openMessage);   // clicking the envelope works too
againBtn.addEventListener('click', replay);
loveBtn.addEventListener('click', sendLove);

enableButtonGlow();
startBackground();
